/**
 * SEO Optimizer Agent (v1.0)
 *
 * Optimizes professional profiles for search visibility:
 *   1. Resume keyword optimization
 *   2. ATS compatibility scoring
 *   3. LinkedIn profile optimization
 *   4. Job description keyword extraction
 *   5. Content scoring and improvement suggestions
 */

import { extractKeywords, matchKeywords, suggestKeywordPlacement } from '../seo/keyword-extractor.js';
import { scoreResumeATS } from '../seo/ats-scorer.js';
import {
  analyzeLinkedIn,
  generateOptimizedHeadline,
  generateOptimizedAbout,
} from '../seo/linkedin-optimizer.js';

export class SeoOptimizerAgent {
  constructor() {
    this.name = 'SEO Optimizer Agent (v1.0)';
  }

  /**
   * Full SEO optimization for a profile
   */
  async optimizeProfile(profile, options = {}) {
    console.log(`[${this.name}] Starting SEO optimization for: ${profile.firstName} ${profile.lastName}`);

    const { targetJobDescription, optimizationType = 'full' } = options;

    const results = {
      profileId: profile._id,
      optimizedAt: new Date().toISOString(),
      sections: {},
    };

    // 1. Extract keywords from job description if provided
    let jobKeywords = [];
    if (targetJobDescription) {
      const extracted = extractKeywords(targetJobDescription);
      jobKeywords = extracted.technical.map(k => k.keyword);
      results.jobKeywords = extracted;
    }

    // 2. Resume SEO analysis
    if (optimizationType === 'full' || optimizationType === 'resume') {
      const resumeText = `${profile.bio || ''} ${profile.coreStack || ''}`;
      const atsResult = scoreResumeATS(resumeText);

      let keywordMatch = null;
      if (jobKeywords.length > 0) {
        const profileSkills = (profile.coreStack || '').split(/[,;]+/).map(s => s.trim());
        keywordMatch = matchKeywords(profile.coreStack, jobKeywords);
        const suggestions = suggestKeywordPlacement(keywordMatch.missing, profile);
        keywordMatch.suggestions = suggestions;
      }

      results.sections.resume = {
        atsScore: atsResult,
        keywordMatch,
        recommendations: this.generateResumeRecommendations(atsResult, keywordMatch),
      };
    }

    // 3. LinkedIn optimization
    if (optimizationType === 'full' || optimizationType === 'linkedin') {
      const linkedInResult = analyzeLinkedIn(profile);
      const optimizedHeadlines = generateOptimizedHeadline(profile, jobKeywords[0]);
      const optimizedAbout = generateOptimizedAbout(profile);

      results.sections.linkedin = {
        score: linkedInResult,
        optimizedHeadlines,
        optimizedAbout,
      };
    }

    // 4. Overall score
    const scores = [];
    if (results.sections.resume) scores.push(results.sections.resume.atsScore.score);
    if (results.sections.linkedin) scores.push(results.sections.linkedin.score.score);

    results.overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    results.grade = results.overallScore >= 90 ? 'A'
      : results.overallScore >= 75 ? 'B'
        : results.overallScore >= 60 ? 'C'
          : results.overallScore >= 40 ? 'D' : 'F';

    console.log(`[${this.name}] SEO optimization complete. Score: ${results.overallScore}/100 (${results.grade})`);
    return results;
  }

  /**
   * Analyze content against a job description
   */
  async analyzeContent(content, targetKeywords = []) {
    const atsResult = scoreResumeATS(content);
    const contentKeywords = extractKeywords(content);

    let keywordAnalysis = null;
    if (targetKeywords.length > 0) {
      keywordAnalysis = matchKeywords(content, targetKeywords);
    }

    return {
      atsScore: atsResult,
      keywords: contentKeywords,
      keywordAnalysis,
      readability: this.estimateReadability(content),
    };
  }

  /**
   * Quick ATS score check
   */
  quickATSCheck(text) {
    return scoreResumeATS(text);
  }

  generateResumeRecommendations(atsResult, keywordMatch) {
    const recs = [];

    if (atsResult.score < 70) {
      recs.push({
        priority: 'high',
        category: 'ATS',
        message: `Your ATS score is ${atsResult.score}/100. Fix ${atsResult.issues.filter(i => i.severity === 'high').length} critical issues to improve pass rate.`,
      });
    }

    if (keywordMatch && keywordMatch.missing.length > 0) {
      recs.push({
        priority: 'high',
        category: 'Keywords',
        message: `Missing ${keywordMatch.missing.length} keywords from job description: ${keywordMatch.missing.slice(0, 5).join(', ')}`,
      });
    }

    if (keywordMatch && keywordMatch.suggestions?.length > 0) {
      for (const s of keywordMatch.suggestions.slice(0, 3)) {
        recs.push({
          priority: s.priority,
          category: 'Placement',
          message: s.reason,
        });
      }
    }

    return recs;
  }

  estimateReadability(text) {
    if (!text) return { score: 0, level: 'unknown' };

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

    let score = 100;
    if (avgWordsPerSentence > 25) score -= 30;
    else if (avgWordsPerSentence > 20) score -= 15;
    if (words.length < 100) score -= 20;

    return {
      score: Math.max(0, Math.min(100, score)),
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      totalWords: words.length,
      totalSentences: sentences.length,
      level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Moderate' : 'Needs Improvement',
    };
  }
}

export default SeoOptimizerAgent;
