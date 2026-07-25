import { AIBrowserDriver } from '../browser-driver.js';
import { generateFieldContent } from '../llm-filler.js';
import { BrowserPool } from '../browser-pool.js';

export class PermitPathfinderAgent {
  constructor() {
    this.name = 'Permit Pathfinder Agent (v2.0)';
    this.usePool = true;
  }

  async apply(url, profile) {
    console.log(`[${this.name}] Starting permit assessment and tracking...`);

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

    try {
      await page.click('button:has-text("Accept Cookies"), button:has-text("I agree")');
    } catch (e) {}

    const fields = await this.scanFormFields(page);
    console.log(`[${this.name}] Found ${fields.length} query fields on the permit wizard.`);

    let fieldsProcessed = 0;

    for (const field of fields) {
      try {
        if (field.type === 'select') {
          const options = await page.$$eval(`${this.getSelector(field)} option`, opts =>
            opts.map(o => ({ value: o.value, text: o.textContent }))
          );
          const bestOption = this.selectBestOption(field, options, profile);
          if (bestOption) {
            await page.selectOption(this.getSelector(field), bestOption.value).catch(() => {});
          }
        } else if (field.type === 'radio') {
          await page.click(this.getSelector(field)).catch(() => {});
        } else if (field.type === 'checkbox') {
          await page.click(this.getSelector(field)).catch(() => {});
        } else {
          const generated = await generateFieldContent(field, profile);
          await this.humanType(page, field, generated);
        }
        fieldsProcessed++;
      } catch (e) {
        console.warn(`[${this.name}] Field fill failed: ${field.name || field.id}`, e.message);
      }
    }

    try {
      await page.click('button:has-text("Next"), button:has-text("Continue"), button:has-text("Submit")');
    } catch (e) {}
    console.log(`[${this.name}] Wizard steps completed. Fields processed: ${fieldsProcessed}`);

    if (this.usePool && poolEntry) {
      BrowserPool.getInstance().release(poolEntry);
    } else if (browser?.close) {
      await browser.close();
    }

    return { success: true, agent: this.name, fieldsProcessed };
  }

  selectBestOption(field, options, profile) {
    const label = (field.label || '').toLowerCase();
    if (label.includes('nationality') || label.includes('country')) {
      return options.find(o => o.text.toLowerCase().includes((profile.nationality || '').toLowerCase())) || options[1];
    }
    if (label.includes('visa') || label.includes('permit')) {
      return options.find(o => o.text.toLowerCase().includes('skilled') || o.text.toLowerCase().includes('highly')) || options[1];
    }
    return options[1] || options[0];
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
