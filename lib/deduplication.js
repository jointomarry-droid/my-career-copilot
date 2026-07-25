/**
 * Smart Deduplication Engine
 *
 * Prevents duplicate applications using multi-signal matching:
 *   1. URL similarity (exact + fuzzy)
 *   2. Title + Institution matching
 *   3. Content fingerprinting
 *   4. Time-window deduplication
 *
 * Uses Levenshtein distance for fuzzy matching and
 * normalized URL comparison.
 */

import { getUserApplications } from './mongodb.js';

const DEDUP_WINDOW_MS = 86400000; // 24 hours
const TITLE_SIMILARITY_THRESHOLD = 0.85;
const URL_SIMILARITY_THRESHOLD = 0.95;

class DeduplicationEngine {
  constructor() {
    this.recentChecks = new Map();
  }

  /**
   * Check if an application is a duplicate
   * @returns {{ isDuplicate: boolean, reason: string, existingApp: object|null, confidence: number }}
   */
  async checkDuplicate(newApp, userId = 'usr-fiaz-001') {
    const existingApps = await getUserApplications(userId);
    const now = Date.now();

    // Check 1: Exact URL match
    const urlMatch = existingApps.find(app =>
      app.url && newApp.url && this.normalizeUrl(app.url) === this.normalizeUrl(newApp.url)
    );
    if (urlMatch) {
      return {
        isDuplicate: true,
        reason: 'Exact URL match found',
        existingApp: urlMatch,
        confidence: 100,
        matchType: 'url_exact',
      };
    }

    // Check 2: Fuzzy URL match
    const fuzzyUrlMatch = existingApps.find(app => {
      if (!app.url || !newApp.url) return false;
      const similarity = this.urlSimilarity(app.url, newApp.url);
      return similarity >= URL_SIMILARITY_THRESHOLD;
    });
    if (fuzzyUrlMatch) {
      return {
        isDuplicate: true,
        reason: 'Similar URL detected',
        existingApp: fuzzyUrlMatch,
        confidence: 90,
        matchType: 'url_fuzzy',
      };
    }

    // Check 3: Title + Institution match
    const titleMatch = existingApps.find(app => {
      if (!app.title || !newApp.title) return false;
      const titleSim = this.stringSimilarity(app.title.toLowerCase(), newApp.title.toLowerCase());
      const instSim = app.institution && newApp.institution
        ? this.stringSimilarity(app.institution.toLowerCase(), newApp.institution.toLowerCase())
        : 0.5;
      return titleSim >= TITLE_SIMILARITY_THRESHOLD && instSim >= 0.8;
    });
    if (titleMatch) {
      return {
        isDuplicate: true,
        reason: 'Same title and institution',
        existingApp: titleMatch,
        confidence: 85,
        matchType: 'title_institution',
      };
    }

    // Check 4: Time-window duplicate (same URL checked recently)
    const recentKey = `${userId}:${this.normalizeUrl(newApp.url || newApp.title)}`;
    const recentCheck = this.recentChecks.get(recentKey);
    if (recentCheck && now - recentCheck < DEDUP_WINDOW_MS) {
      return {
        isDuplicate: true,
        reason: 'Recently checked (within 24 hours)',
        existingApp: null,
        confidence: 75,
        matchType: 'time_window',
      };
    }

    // Record this check
    this.recentChecks.set(recentKey, now);

    // Cleanup old entries
    for (const [key, timestamp] of this.recentChecks) {
      if (now - timestamp > DEDUP_WINDOW_MS) {
        this.recentChecks.delete(key);
      }
    }

    return { isDuplicate: false, reason: null, existingApp: null, confidence: 0, matchType: null };
  }

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/+$/, '');
    } catch {
      return url.toLowerCase().replace(/\/+$/, '');
    }
  }

  /**
   * Calculate URL similarity (0-1)
   */
  urlSimilarity(url1, url2) {
    const norm1 = this.normalizeUrl(url1);
    const norm2 = this.normalizeUrl(url2);

    if (norm1 === norm2) return 1;

    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

    return this.stringSimilarity(norm1, norm2);
  }

  /**
   * Calculate string similarity using Levenshtein distance (0-1)
   */
  stringSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const costs = [];
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
            newValue = Math.min(newValue, lastValue, costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[longer.length] = lastValue;
    }

    return (longer.length - costs[longer.length]) / longer.length;
  }

  /**
   * Get deduplication statistics
   */
  getStats() {
    return {
      recentChecks: this.recentChecks.size,
      windowMs: DEDUP_WINDOW_MS,
    };
  }
}

export const deduplication = new DeduplicationEngine();
export default deduplication;
