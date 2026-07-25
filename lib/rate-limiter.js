const stores = new Map();

function getStore(namespace) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace);
}

export function rateLimit({ namespace = 'default', max = 100, window = 60000 } = {}) {
  const store = getStore(namespace);
  const now = Date.now();

  for (const [key, record] of store.entries()) {
    if (now - record.windowStart > window) {
      store.delete(key);
    }
  }

  return {
    check(key) {
      const fullKey = `${namespace}:${key}`;
      if (!store.has(fullKey)) {
        store.set(fullKey, { count: 1, windowStart: now });
        return { allowed: true, remaining: max - 1, resetAt: now + window };
      }

      const record = store.get(fullKey);
      if (now - record.windowStart > window) {
        store.set(fullKey, { count: 1, windowStart: now });
        return { allowed: true, remaining: max - 1, resetAt: now + window };
      }

      record.count++;
      if (record.count > max) {
        return { allowed: false, remaining: 0, resetAt: record.windowStart + window };
      }

      return { allowed: true, remaining: max - record.count, resetAt: record.windowStart + window };
    },

    reset(key) {
      store.delete(`${namespace}:${key}`);
    },

    getStats() {
      let totalRequests = 0;
      let blockedRequests = 0;
      for (const [, record] of store.entries()) {
        totalRequests += record.count;
        if (record.count > max) blockedRequests++;
      }
      return { totalRequests, blockedRequests, activeKeys: store.size };
    }
  };
}

export const apiLimiter = rateLimit({ namespace: 'api', max: 30, window: 60000 });
export const authLimiter = rateLimit({ namespace: 'auth', max: 5, window: 900000 });
export const searchLimiter = rateLimit({ namespace: 'search', max: 20, window: 60000 });
export const uploadLimiter = rateLimit({ namespace: 'upload', max: 10, window: 300000 });
