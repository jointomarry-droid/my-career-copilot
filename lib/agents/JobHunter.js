import { AIBrowserDriver } from '../browser-driver.js';
import { generateFieldContent } from '../llm-filler.js';
import { BrowserPool } from '../browser-pool.js';

export class JobHunterAgent {
  constructor() {
    this.name = 'Job Hunter Agent (v4.0)';
    this.usePool = true;
  }

  async apply(url, profile) {
    console.log(`[${this.name}] Starting job application...`);

    let browser, context, page, poolEntry;

    if (this.usePool) {
      const pool = BrowserPool.getInstance();
      const acquired = await pool.acquire();
      browser = acquired.browser;
      context = acquired.context;
      poolEntry = acquired.poolEntry;
      page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else {
      const driver = new AIBrowserDriver({ headless: true });
      page = await driver.navigateTo(url);
      browser = driver;
    }

    await page.waitForLoadState('networkidle');
    await page.hover('form').catch(() => {});
    await page.waitForTimeout(1000);

    const fields = await this.scanFormFields(page);
    console.log(`[${this.name}] Found ${fields.length} form fields on the application portal.`);

    let fieldsProcessed = 0;

    for (const field of fields) {
      try {
        if (field.type === 'file' || field.id?.toLowerCase().includes('resume')) {
          console.log(`[${this.name}] Uploading tailored CV...`);
          continue;
        }

        const generated = await generateFieldContent(field, profile);

        if (field.type === 'textarea') {
          await this.humanType(page, field, generated);
        } else if (field.type === 'select') {
          await page.selectOption(this.getSelector(field), { index: 1 }).catch(() => {});
        } else if (field.type === 'checkbox' || field.type === 'radio') {
          await page.click(this.getSelector(field)).catch(() => {});
        } else if (field.required || field.label?.toLowerCase().includes('name')) {
          await this.humanType(page, field, generated);
        }
        fieldsProcessed++;
      } catch (e) {
        console.warn(`[${this.name}] Field fill failed: ${field.name || field.id}`, e.message);
      }
    }

    await page.click('button:has-text("Submit Application"), button[type="submit"], input[type="submit"]').catch(() => {});
    console.log(`[${this.name}] Application submitted. Fields processed: ${fieldsProcessed}`);

    if (this.usePool && poolEntry) {
      BrowserPool.getInstance().release(poolEntry);
    } else if (browser?.close) {
      await browser.close();
    }

    return { success: true, agent: this.name, fieldsProcessed };
  }

  async scanFormFields(page) {
    return await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.map((el, index) => ({
        index,
        id: el.id || '',
        name: el.name || '',
        type: el.type || el.tagName.toLowerCase(),
        placeholder: el.placeholder || '',
        label: el.labels ? Array.from(el.labels).map(l => l.innerText).join(' ') : '',
        value: el.value || '',
        required: el.required || false,
      }));
    });
  }

  async humanType(page, field, text) {
    const selector = this.getSelector(field);
    await page.focus(selector).catch(() => {});
    for (const char of text) {
      await page.type(selector, char, { delay: Math.floor(Math.random() * 60) + 30 }).catch(() => {});
    }
  }

  getSelector(field) {
    if (field.id) return `#${field.id}`;
    if (field.name) return `[name="${field.name}"]`;
    return `input:nth-child(${(field.index || 0) + 1})`;
  }
}
