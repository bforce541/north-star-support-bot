import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage.jsx';
import {
  detectIntent,
  handleOrderTracking,
  handleReturns,
  handleRecommendationFlow,
  handleHumanHandoff,
  handleFallback,
} from './chatbotLogic.js';
import './App.css';

function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function botMsg(text) {
  return { id: Date.now() + Math.random(), sender: 'bot', text, timestamp: getTimestamp() };
}

function userMsg(text) {
  return { id: Date.now() + Math.random(), sender: 'user', text, timestamp: getTimestamp() };
}

const GREETING =
  `Hey there, trail-blazer! 👋 Welcome to **North Star Support**.\n\nI'm here to help you with:\n\n• 📦 **Order tracking**\n• 🔄 **Returns & exchanges**\n• 🛒 **Product recommendations**\n• 👤 **Live Agent support**\n\nWhat can I help you with today?`;

const INITIAL_STATE = {
  flow: null,
  step: 0,
  activityContext: null,
  fallbackCount: 0,
};

export default function App() {
  const [messages, setMessages] = useState([botMsg(GREETING)]);
  const [input, setInput] = useState('');
  const [conversationState, setConversationState] = useState(INITIAL_STATE);
  const [isLiveAgent, setIsLiveAgent] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function addMessages(...msgs) {
    setMessages((prev) => [...prev, ...msgs]);
  }

  function resetToMenu(extraMsg) {
    setConversationState(INITIAL_STATE);
    if (extraMsg) {
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(extraMsg)]);
      }, 700);
    }
  }

  function processMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const uMsg = userMsg(trimmed);
    setInput('');

    if (isLiveAgent) {
      setMessages((prev) => [
        ...prev,
        uMsg,
        botMsg("Your message has been received. Our Live Agent will respond via email shortly. Is there anything else you'd like to add?"),
      ]);
      return;
    }

    setMessages((prev) => [...prev, uMsg]);

    const { flow, step, activityContext, fallbackCount } = conversationState;

    // Detect intent early so active flows can be escaped by a new intent
    const intent = detectIntent(trimmed);
    const isReset = /\b(menu|cancel|nevermind|never mind|start over|back|stop|exit)\b/i.test(trimmed);

    // Escape active flow on explicit reset keyword
    if ((flow === 'ORDER' || flow === 'RECS') && isReset) {
      resetToMenu("No problem! What else can I help you with today?");
      return;
    }

    // Active ORDER flow — stay in it only if intent is ORDER_TRACKING or ambiguous (UNKNOWN)
    // Any other clear intent (RETURNS, RECOMMENDATIONS, HUMAN_HANDOFF) falls through to routing
    if (flow === 'ORDER' && (intent === 'UNKNOWN' || intent === 'ORDER_TRACKING')) {
      const result = handleOrderTracking(trimmed);
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        if (result.type === 'ORDER_RESULT' || result.type === 'ORDER_NOT_FOUND') {
          resetToMenu(result.followUp || null);
        }
      }, 400);
      return;
    }

    // Active RECS flow — stay in it only if intent is RECOMMENDATIONS or ambiguous (UNKNOWN)
    if (flow === 'RECS' && (intent === 'UNKNOWN' || intent === 'RECOMMENDATIONS')) {
      const result = handleRecommendationFlow(trimmed, step, activityContext);
      if (!result) return;
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        if (result.type === 'RECOMMENDATION_RESULT') {
          resetToMenu(result.followUp || null);
        } else {
          setConversationState((s) => ({
            ...s,
            step: s.step + 1,
            activityContext: result.activity || s.activityContext,
            fallbackCount: 0,
          }));
        }
      }, 400);
      return;
    }

    // No active flow, or mid-flow escape — route by detected intent
    if (intent === 'HUMAN_HANDOFF') {
      const result = handleHumanHandoff();
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        setIsLiveAgent(true);
        setConversationState({ ...INITIAL_STATE, flow: 'HUMAN' });
      }, 400);
      return;
    }

    if (intent === 'ORDER_TRACKING') {
      const result = handleOrderTracking(trimmed);
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        if (result.type === 'ORDER_RESULT' || result.type === 'ORDER_NOT_FOUND') {
          resetToMenu(result.followUp || null);
        } else {
          setConversationState({ ...INITIAL_STATE, flow: 'ORDER' });
        }
      }, 400);
      return;
    }

    if (intent === 'RETURNS') {
      const result = handleReturns();
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        resetToMenu(result.followUp || null);
      }, 400);
      return;
    }

    if (intent === 'RECOMMENDATIONS') {
      const result = handleRecommendationFlow(trimmed, 0, null);
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg(result.text)]);
        if (result.type === 'RECOMMENDATION_RESULT') {
          resetToMenu(result.followUp || null);
        } else {
          setConversationState({ ...INITIAL_STATE, flow: 'RECS', step: 1 });
        }
      }, 400);
      return;
    }

    // Fallback
    const newCount = fallbackCount + 1;
    const result = handleFallback(newCount);
    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg(result.text)]);
      if (result.escalate) {
        const handoff = handleHumanHandoff();
        setTimeout(() => {
          setMessages((prev) => [...prev, botMsg(handoff.text)]);
          setIsLiveAgent(true);
          setConversationState({ ...INITIAL_STATE, flow: 'HUMAN' });
        }, 600);
      } else {
        setConversationState((s) => ({ ...s, fallbackCount: newCount }));
      }
    }, 400);
  }

  function handleQuickAction(action) {
    if (isLiveAgent) return;
    const labels = {
      order: 'Track my order',
      returns: 'I want to make a return',
      recs: 'I need product recommendations',
      agent: 'I want to talk to a live agent',
    };
    processMessage(labels[action]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processMessage(input);
    }
  }

  function handleEndSession() {
    setIsLiveAgent(false);
    setConversationState(INITIAL_STATE);
    setMessages((prev) => [
      ...prev,
      botMsg(
        "You've been disconnected from the Live Agent session. I'm back and ready to help!\n\n• 📦 Order tracking\n• 🔄 Returns & exchanges\n• 🛒 Product recommendations\n• 👤 Live Agent"
      ),
    ]);
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-icon">🌟</div>
          <div className="header-text">
            <h1>North Star Support Bot</h1>
            <p>Outdoor gear support for orders, returns, and recommendations</p>
          </div>
        </div>
        {isLiveAgent && (
          <div className="live-agent-badge">
            <span className="pulse-dot" />
            Live Agent Active
          </div>
        )}
      </header>

      {isLiveAgent && (
        <div className="live-agent-banner">
          <span>
            🧑‍💼 Connected to a <strong>Live Agent</strong>. An agent will respond via email — avg. wait under 2 hours (Mon–Fri, 9am–6pm ET).
          </span>
          <button className="disconnect-btn" onClick={handleEndSession}>
            End Session
          </button>
        </div>
      )}

      <main className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </main>

      {!isLiveAgent && (
        <div className="quick-actions" role="group" aria-label="Quick actions">
          <button onClick={() => handleQuickAction('order')}>📦 Track Order</button>
          <button onClick={() => handleQuickAction('returns')}>🔄 Returns &amp; Exchanges</button>
          <button onClick={() => handleQuickAction('recs')}>🛒 Product Recs</button>
          <button onClick={() => handleQuickAction('agent')}>👤 Live Agent</button>
        </div>
      )}

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLiveAgent ? 'Leave a message for your agent…' : 'Type a message and press Enter…'}
          className="chat-input"
          aria-label="Chat input"
          autoFocus
        />
        <button
          className="send-btn"
          onClick={() => processMessage(input)}
          aria-label="Send"
          disabled={!input.trim()}
        >
          Send ➤
        </button>
      </div>
    </div>
  );
}
