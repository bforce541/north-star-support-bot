# North Star Support Bot

A functional customer support chatbot for **North Star Outdoor**, a simulated e-commerce store specializing in outdoor apparel and camping gear. Built with React + Vite, runs entirely in the browser with no backend or external APIs required.

---

## Features

- **Order Tracking** — look up mock orders #111, #222, and #333 with real status responses
- **Returns & Exchanges** — explains the 30-day return policy and links to the returns portal
- **Product Recommendations** — asks clarifying questions and recommends gear categories by activity
- **Live Agent Handoff** — transitions the UI into a clearly marked Live Agent mode
- **Fallback Handling** — catches unrecognized input and escalates after repeated failures
- **Quick Action Buttons** — one-click shortcuts for all four core flows
- **Keyboard-friendly** — Enter key sends messages; fully accessible markup
- **Mobile-responsive** — works on phones, tablets, and desktops
- **Outdoor-themed UI** — forest greens, slate, and cream palette

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 |
| Build tool | Vite 4 |
| Language | JavaScript (ES modules) |
| Styling | Plain CSS (CSS custom properties) |
| Markdown rendering | react-markdown |
| Backend | None — mock data only |
| Database | None |

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/yoshuaa0/north-star-support-bot.git
cd north-star-support-bot

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Core Use Cases Covered

### 1. Order Tracking
Triggered by phrases like "Where is my order?", "Track my package", "order status", "order #111", or a bare number like `111` typed directly.

- Accepts a bare order number typed directly (e.g., `111` or `#222`), with or without `#`
- Also asks for the order number if a tracking phrase is used without one
- Returns mock status for orders 111, 222, 333
- Returns an error message with escalation option for any other number

### 2. Returns & Exchanges
Triggered by phrases like "I want to return something", "exchange item", "return policy", "how do returns work?", etc.

- Explains the 30-day return policy clearly
- States items must be unused and in original packaging
- Provides the simulated returns link: https://northstar.example.com/returns
- Mentions exchanges start through the same link

### 3. Product Recommendations
Triggered by phrases like "recommend gear", "what should I buy?", "need camping gear", "what jacket should I get?", "I want to go hiking", "want to hike", "planning to camp", etc.

- Asks about activity type (hiking, camping, backpacking, cold weather, rain, casual)
- Recommends a product **category** (not a specific product)
- Recommendation logic:
  - Hiking → Hiking Boots & Trail Layers
  - Camping → Tents, Sleeping Bags & Camp Chairs
  - Backpacking → Lightweight Packs & Compact Sleeping Gear
  - Cold weather → Insulated Jackets & Thermal Base Layers
  - Rain/wet → Waterproof Shells & Dry Bags
  - Casual → Fleece Layers & Everyday Trail Pants

### 4. Human Handoff
Triggered by "human", "agent", "representative", "talk to someone", "live agent", "support person", etc.

- Bot transitions to Live Agent mode
- UI shows a green banner with a pulsing dot indicator
- Bot prompts user to share name, email, and issue description

---

## Mock Order Data

| Order # | Status | Detail |
|---------|--------|--------|
| 111 | Shipped | Arriving tomorrow |
| 222 | Processing | Ships within 24 hours |
| 333 | Delivered | Asks if everything arrived okay |
| Any other | Not found | Error + option to try again or talk to agent |

---

## Video Demo Script

> Recommended length: 2–3 minutes. Narrate each scenario as you type.

### Scenario 1 — Order Tracking (30 sec)
1. Type: `Where is my order?`
2. Bot asks for order number
3. Type: `111`
4. Bot responds: *Shipped — arriving tomorrow*
5. Type: `Order #222`
6. Bot responds: *Processing — ships in 24 hours*
7. Type: `333`
8. Bot responds: *Delivered. Did everything arrive okay?*

### Scenario 2 — Returns & Exchanges (20 sec)
1. Type: `I want to exchange my jacket`
2. Bot explains 30-day return policy, unused items, original packaging
3. Bot provides returns portal link

### Scenario 3 — Product Recommendations (30 sec)
1. Type: `I need camping gear`
2. Bot asks what kind of outdoor activity
3. Type: `I'm going backpacking`
4. Bot recommends: *Lightweight Packs & Compact Sleeping Gear*

### Scenario 4 — Human Handoff (20 sec)
1. Type: `I want to talk to a human`
2. Bot confirms Live Agent connection
3. UI shows green "Live Agent Active" banner with pulsing dot
4. Demonstrate the "End Session" button

### Scenario 5 — Fallback (20 sec)
1. Type: `banana compass pizza`
2. Bot says it didn't understand and lists available options
3. Type another nonsense message
4. Bot escalates automatically to Live Agent

---

## Testing Checklist

Run through each input manually before submission:

- [ ] `Where is my order?` → bot asks for order number
- [ ] `Track my package` → bot asks for order number
- [ ] `111` → Shipped status
- [ ] `Order #222` → Processing status
- [ ] `333` → Delivered status
- [ ] `999` → Invalid order, offer retry or agent
- [ ] `I want to return something` → Returns policy + link
- [ ] `Can I exchange my jacket?` → Returns policy + link
- [ ] `Return policy` → Returns policy + link
- [ ] `Recommend gear` → Activity clarification question
- [ ] `I'm going backpacking` → Lightweight packs recommendation
- [ ] `cold weather` → Insulated jackets recommendation
- [ ] `human` → Live Agent mode activated
- [ ] `talk to someone` → Live Agent mode activated
- [ ] `banana compass pizza` → Friendly fallback message
- [ ] Second nonsense message → Auto-escalate to Live Agent
- [ ] Quick action buttons → Each triggers correct flow
- [ ] Enter key → Sends message
- [ ] Mobile layout → Layout adapts cleanly

---

## Submission Checklist

- [x] React + Vite project with `npm install` && `npm run dev`
- [x] Order tracking — all 4 order scenarios (111, 222, 333, unknown)
- [x] Returns & exchanges — policy explained + returns link provided
- [x] Product recommendations — activity-based, category-level responses
- [x] Human handoff — Live Agent UI state clearly shown
- [x] Fallback handling — unknown input caught + escalation after repeats
- [x] Intent recognition — natural language variations handled
- [x] Quick action buttons for all 4 flows
- [x] Chat history maintained in UI
- [x] Mobile-friendly responsive layout
- [x] Outdoor-themed visual design
- [x] README with all required sections
- [x] Video demo script included
- [x] Committed to GitHub with message `ai chatbot`
- [x] Pushed to `main` branch

---

## Project Structure

```
north-star-support-bot/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── chatbotLogic.js          # Intent detection + all flow handlers
    ├── data/
    │   └── mockOrders.js        # Mock order data + lookup function
    └── components/
        └── ChatMessage.jsx      # Message bubble component
```

---

*Built for North Star Outdoor — "Find your trail."*
