export const mockOrders = {
  '111': {
    status: 'Shipped',
    detail: 'Your order is on its way — arriving tomorrow!',
    emoji: '🚚',
  },
  '222': {
    status: 'Processing',
    detail: 'Your order is being prepared and ships within 24 hours.',
    emoji: '⏳',
  },
  '333': {
    status: 'Delivered',
    detail: 'Your order was delivered. Did everything arrive okay?',
    emoji: '✅',
  },
};

export function lookupOrder(orderNumber) {
  const normalized = String(orderNumber).replace(/^#/, '').trim();
  return mockOrders[normalized] || null;
}
