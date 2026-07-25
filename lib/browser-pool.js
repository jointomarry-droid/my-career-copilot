/**
 * Browser Connection Pool
 *
 * Reuses Chromium instances across jobs to reduce memory usage.
 * Instead of spawning a new browser per application, maintains a pool
 * of reusable browser contexts with configurable max concurrency.
 *
 * Usage:
 *   const pool = BrowserPool.getInstance();
 *   const { browser, context } = await pool.acquire();
 *   try {
 *     // use context
 *   } finally {
 *     pool.release(browser);
 *   }
 */

import { chromium } from 'playwright';

class BrowserPool {
  constructor(options = {}) {
    this.maxBrowsers = options.maxBrowsers || 3;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.available = [];
    this.inUse = new Set();
    this.pending = [];
  }

  static getInstance() {
    if (!BrowserPool._instance) {
      BrowserPool._instance = new BrowserPool();
    }
    return BrowserPool._instance;
  }

  async acquire() {
    // Reuse an available browser
    if (this.available.length > 0) {
      const entry = this.available.pop();
      this.inUse.add(entry);
      const context = await entry.browser.newContext({
        userAgent: this.userAgent,
        viewport: { width: 1280, height: 720 },
        locale: 'en-US',
        timezoneId: 'Europe/Amsterdam',
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      return { browser: entry.browser, context, poolEntry: entry };
    }

    // Create new browser if under limit
    if (this.inUse.size < this.maxBrowsers) {
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--use-fake-ui-for-media-stream',
          '--window-size=1280,720',
        ],
      });
      const entry = { browser, id: Date.now() };
      this.inUse.add(entry);
      const context = await browser.newContext({
        userAgent: this.userAgent,
        viewport: { width: 1280, height: 720 },
        locale: 'en-US',
        timezoneId: 'Europe/Amsterdam',
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      return { browser, context, poolEntry: entry };
    }

    // Wait for a browser to become available
    return new Promise((resolve) => {
      this.pending.push(resolve);
    });
  }

  release(entry) {
    this.inUse.delete(entry);

    // Resolve a waiting request with a fresh context
    if (this.pending.length > 0) {
      const next = this.pending.shift();
      this.inUse.add(entry);
      entry.browser.newContext({
        userAgent: this.userAgent,
        viewport: { width: 1280, height: 720 },
        locale: 'en-US',
        timezoneId: 'Europe/Amsterdam',
      }).then(async (context) => {
        await context.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });
        next({ browser: entry.browser, context, poolEntry: entry });
      }).catch(() => {
        next({ browser: entry.browser, context: null, poolEntry: entry });
      });
      return;
    }

    // Return to available pool
    this.available.push(entry);
  }

  async closeAll() {
    for (const entry of this.inUse) {
      try { await entry.browser.close(); } catch (e) {}
    }
    for (const entry of this.available) {
      try { await entry.browser.close(); } catch (e) {}
    }
    this.inUse.clear();
    this.available = [];
    this.pending = [];
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      pending: this.pending.length,
      maxBrowsers: this.maxBrowsers,
    };
  }
}

BrowserPool._instance = null;

export { BrowserPool };
export default BrowserPool;
