/**
 * Smart Discovery Engine
 */

import { AIBrowserDriver } from './browser-driver.js';
import { insertDiscovery } from './mongodb.js';

const DISCOVERY_SOURCES = {
  scholarships: [
    { name: 'DAAD Scholarships', url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', country: 'Germany', type: 'Scholarship', selectors: { listing: '.c-teaser, .c-card, [class*="scholarship"]', title: 'h3, h2, .c-teaser__title', link: 'a[href]', deadline: '[class*="deadline"], time' } },
    { name: 'Chevening Scholarships', url: 'https://www.chevening.org/scholarships/', country: 'United Kingdom', type: 'Scholarship', selectors: { listing: '.scholarship-item, article, .card', title: 'h2, h3, .card-title', link: 'a[href]', deadline: '.deadline, time' } },
    { name: 'Erasmus Mundus', url: 'https://erasmus-plus.ec.europa.eu/', country: 'Europe', type: 'Scholarship', selectors: { listing: '.listing-item, article, .opportunity-card', title: 'h2, h3, .title', link: 'a[href]', deadline: '.deadline, time' } },
  ],
  jobs: [
    { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/?keywords=AI+Engineer&location=Europe', country: 'Global', type: 'Job', selectors: { listing: '.base-card, .job-search-card', title: 'h3, .base-search-card__title', link: 'a[href]', company: '.base-search-card__subtitle' } },
    { name: 'Indeed Jobs', url: 'https://www.indeed.com/jobs?q=software+engineer+AI&l=Europe', country: 'Global', type: 'Job', selectors: { listing: '.jobsearch-ResultsList .result', title: 'h2 a, .jobTitle a', link: 'a[href]', company: '.companyName' } },
  ],
  permits: [
    { name: 'IND Netherlands', url: 'https://ind.nl/en/working/working-in-the-netherlands', country: 'Netherlands', type: 'Work Permit', selectors: { listing: '.accordion-item, .content-block, article', title: 'h2, h3', link: 'a[href]' } },
    { name: 'UK Visas', url: 'https://www.gov.uk/browse/visas-immigration', country: 'United Kingdom', type: 'Work Permit', selectors: { listing: '.browse-list li, .gem-c-document-list__item', title: 'h3', link: 'a[href]' } },
  ],
};

export class DiscoveryEngine {
  constructor() {
    this.driver = new AIBrowserDriver({ headless: true });
    this.discovered = [];
  }

  async discoverAll(userId) {
    console.log('[Discovery] Starting full sweep...');
    const results = [];

    for (const category of Object.keys(DISCOVERY_SOURCES)) {
      for (const source of DISCOVERY_SOURCES[category]) {
        try {
          const items = await this.scrapeSource(source, userId);
          results.push(...items);
          console.log(`[Discovery] ${source.name}: Found ${items.length} items`);
        } catch (err) {
          console.error(`[Discovery] ${source.name} failed:`, err.message);
        }
      }
    }

    this.discovered = results;
    console.log(`[Discovery] Sweep complete. Total: ${results.length} opportunities.`);
    return results;
  }

  async scrapeSource(source, userId) {
    const page = await this.driver.navigateTo(source.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    try {
      await page.click('button:has-text("Accept"), #onetrust-accept-btn-handler', { timeout: 3000 });
    } catch (e) {}

    const items = await page.evaluate((selectors) => {
      const elements = document.querySelectorAll(selectors.listing);
      return Array.from(elements).slice(0, 20).map(el => {
        const linkEl = el.querySelector(selectors.link);
        const titleEl = el.querySelector(selectors.title);
        return {
          title: titleEl?.innerText?.trim() || el.innerText?.trim().substring(0, 100),
          url: linkEl?.href || '',
        };
      }).filter(item => item.title && item.url);
    }, source.selectors);

    const discoveries = [];
    for (const item of items) {
      const disc = await insertDiscovery({
        userId,
        source: source.name,
        type: source.type,
        country: source.country,
        title: item.title,
        url: item.url,
      });
      discoveries.push(disc);
    }

    return discoveries;
  }

  async close() {
    await this.driver.close();
  }
}
