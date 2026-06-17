import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const { sender, text, timestamp } = message;
  const isBot = sender === 'bot';

  return (
    <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      {isBot && (
        <div className="avatar bot-avatar" aria-label="North Star Bot">
          🌟
        </div>
      )}
      <div className={`bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
        <span className="timestamp">{timestamp}</span>
      </div>
      {!isBot && (
        <div className="avatar user-avatar" aria-label="You">
          🧭
        </div>
      )}
    </div>
  );
}
