/**
 * AI Career Copilot — Playwright System Diagnostic
 *
 * Usage: node test_crawler.js
 */

import { AIBrowserDriver } from './lib/browser-driver.js';

async function testAutomation() {
  console.log("================================================");
  console.log("AI Career Copilot: Automation Diagnostics");
  console.log("================================================");

  const driver = new AIBrowserDriver({ headless: true });

  try {
    console.log("[1/4] Spawning Chromium headless...");
    await driver.init();

    const targetUrl = 'https://news.ycombinator.com/login';
    console.log(`[2/4] Navigating to: ${targetUrl}`);
    const page = await driver.navigateTo(targetUrl);

    console.log("[3/4] Scanning DOM...");
    await page.waitForTimeout(1500);

    const fields = await driver.scanFormFields(page);

    console.log(`[4/4] Found ${fields.length} fields:`);
    fields.forEach(f => {
      console.log(`     -> ID: [${f.id}] | Type: [${f.type}] | Name: [${f.name}]`);
    });

    console.log("\nBrowser automation engine operational.");
  } catch (err) {
    console.error("Diagnostics failed:", err);
  } finally {
    await driver.close();
  }
}

testAutomation();
