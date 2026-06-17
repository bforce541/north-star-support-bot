import { lookupOrder } from './data/mockOrders.js';

// ── Intent detection ──────────────────────────────────────────────────────────

export function detectIntent(message) {
  const m = message.toLowerCase();

  if (/\b(human|agent|representative|live agent|talk to someone|support person|real person|speak to)\b/.test(m))
    return 'HUMAN_HANDOFF';

  if (/\b(track|where.*(is|are|my)|order status|package|shipment|order number|my order|order #?\d+)\b/.test(m) || /\border\s*#?\d+/i.test(m))
    return 'ORDER_TRACKING';

  if (/\b(return|exchange|refund|send back|policy|how do returns|unused|packaging)\b/.test(m))
    return 'RETURNS';

  if (/\b(recommend|suggest|what should i buy|help me pick|need gear|camping gear|hiking gear|what jacket|best|looking for|what.*buy|gear for|going (hiking|camping|backpacking))\b/.test(m))
    return 'RECOMMENDATIONS';

  return 'UNKNOWN';
}

// ── Order tracking ────────────────────────────────────────────────────────────

export function handleOrderTracking(message) {
  const match = message.match(/#?(\d+)/);
  if (match) {
    const orderNum = match[1];
    const order = lookupOrder(orderNum);
    if (order) {
      return {
        type: 'ORDER_RESULT',
        text: `${order.emoji} **Order #${orderNum} — ${order.status}**\n\n${order.detail}`,
        followUp: "Is there anything else I can help you with today?",
      };
    }
    return {
      type: 'ORDER_NOT_FOUND',
      text: `Hmm, I couldn't find an order with number **#${orderNum}**. Please double-check the number on your confirmation email.\n\nWould you like to try a different order number, or connect with a Live Agent?`,
    };
  }
  return {
    type: 'ASK_ORDER_NUMBER',
    text: "I'd be happy to help track your order! What's your order number? You can find it in your confirmation email. (e.g., 111, 222, or 333)",
  };
}

// ── Returns & exchanges ───────────────────────────────────────────────────────

export function handleReturns() {
  return {
    type: 'RETURNS_INFO',
    text: `Here's our **Return & Exchange Policy**:\n\n• **30-day return window** from the date of purchase\n• Items must be **unused** and in their original condition\n• Items must be in **original packaging**\n\nTo start a return or exchange, visit our returns portal:\n👉 [northstar.example.com/returns](https://northstar.example.com/returns)\n\nExchanges can also be initiated through the same link — just select "Exchange" instead of "Return."`,
    followUp: "Is there anything else I can help you with?",
  };
}

// ── Product recommendations ───────────────────────────────────────────────────

const activityKeywords = {
  hiking: ['hik', 'trail', 'walk', 'trek'],
  camping: ['camp', 'campsite', 'campfire'],
  backpacking: ['backpack', 'ultralight', 'thru-hike', 'multi-day'],
  'cold weather': ['cold', 'winter', 'freeze', 'snow', 'freezing'],
  'rain/wet': ['rain', 'wet', 'waterproof', 'storm', 'drizzle'],
  casual: ['casual', 'everyday', 'lifestyle', 'around town'],
};

const recommendations = {
  hiking: {
    category: 'Hiking Boots & Trail Layers',
    detail: 'Sturdy hiking boots with ankle support, moisture-wicking base layers, and a packable mid-layer are your best bet for the trail.',
    emoji: '🥾',
  },
  camping: {
    category: 'Tents, Sleeping Bags & Camp Chairs',
    detail: 'A quality 3-season tent, a temperature-rated sleeping bag, and a compact camp chair will set you up for a great camp experience.',
    emoji: '⛺',
  },
  backpacking: {
    category: 'Lightweight Packs & Compact Sleeping Gear',
    detail: 'For backpacking, go ultralight: a frameless or semi-frame pack, a down sleeping bag with a compression sack, and a compact sleeping pad.',
    emoji: '🎒',
  },
  'cold weather': {
    category: 'Insulated Jackets & Thermal Base Layers',
    detail: 'Layer up with a thermal base layer (merino or synthetic), a fleece mid-layer, and an insulated down or synthetic jacket as your outer shell.',
    emoji: '🧥',
  },
  'rain/wet': {
    category: 'Waterproof Shells & Dry Bags',
    detail: 'A hardshell or softshell waterproof jacket, waterproof pants, and dry bags to protect your gear are must-haves for wet conditions.',
    emoji: '🌧️',
  },
  casual: {
    category: 'Fleece Layers & Everyday Trail Pants',
    detail: 'A cozy fleece pullover and versatile trail pants (stretch, quick-dry) are perfect for casual outdoor use or everyday wear.',
    emoji: '🌿',
  },
};

export function detectActivity(message) {
  const m = message.toLowerCase();
  for (const [activity, keywords] of Object.entries(activityKeywords)) {
    if (keywords.some((k) => m.includes(k))) return activity;
  }
  return null;
}

export function handleRecommendationFlow(message, step, activityContext) {
  if (step === 0) {
    const activity = detectActivity(message);
    if (activity) {
      const rec = recommendations[activity];
      return {
        type: 'RECOMMENDATION_RESULT',
        text: `${rec.emoji} Based on **${activity}**, I'd recommend:\n\n**${rec.category}**\n\n${rec.detail}`,
        followUp: "Would you like to explore other gear options, or is there anything else I can help you with?",
        activity,
      };
    }
    return {
      type: 'ASK_ACTIVITY',
      text: "I'd love to help you find the right gear! What kind of outdoor activity are you planning?\n\n• 🥾 Hiking\n• ⛺ Camping\n• 🎒 Backpacking\n• 🧥 Cold weather adventures\n• 🌧️ Rainy / wet conditions\n• 🌿 Casual outdoor use",
    };
  }

  if (step === 1) {
    const activity = detectActivity(message);
    if (activity) {
      const rec = recommendations[activity];
      return {
        type: 'RECOMMENDATION_RESULT',
        text: `${rec.emoji} Great choice! For **${activity}**, I'd recommend:\n\n**${rec.category}**\n\n${rec.detail}`,
        followUp: "Would you like help with anything else?",
        activity,
      };
    }
    return {
      type: 'ASK_CONDITIONS',
      text: "Got it! One more question — what are the conditions like?\n\n• Warm & sunny\n• Cold & freezing\n• Wet & rainy\n• Lightweight / budget-friendly priority",
    };
  }

  if (step === 2) {
    const activity = activityContext || detectActivity(message);
    const rec = recommendations[activity] || recommendations.casual;
    return {
      type: 'RECOMMENDATION_RESULT',
      text: `${rec.emoji} Based on your needs, I'd recommend:\n\n**${rec.category}**\n\n${rec.detail}`,
      followUp: "Is there anything else I can help you with today?",
      activity,
    };
  }

  return null;
}

// ── Human handoff ─────────────────────────────────────────────────────────────

export function handleHumanHandoff() {
  return {
    type: 'HUMAN_HANDOFF',
    text: "No problem! You're now being connected to a **Live Agent**.\n\nPlease share your **name**, **email address**, and a **short description of your issue**, and an agent will be with you shortly.\n\n*Average response time: under 2 hours during business hours (Mon–Fri, 9am–6pm ET).*",
  };
}

// ── Fallback ──────────────────────────────────────────────────────────────────

export function handleFallback(fallbackCount) {
  if (fallbackCount >= 2) {
    return {
      type: 'FALLBACK_ESCALATE',
      text: "I'm having trouble understanding. Let me connect you with a Live Agent who can sort this out for you.",
      escalate: true,
    };
  }
  return {
    type: 'FALLBACK',
    text: "Hmm, I didn't quite catch that! I can help you with:\n\n• 📦 **Order tracking**\n• 🔄 **Returns & exchanges**\n• 🛒 **Product recommendations**\n• 👤 **Connecting to a Live Agent**\n\nWhat can I help you with today?",
  };
}
