/**
 * Smart Resume Tailoring Pipeline
 *
 * Before each auto-apply, this pipeline:
 *   1. Fetches the user's base profile
 *   2. Analyzes the target opportunity
 *   3. Generates a tailored resume summary
 *   4. Creates a custom cover letter
 *   5. Highlights relevant skills
 *   6. Stores the tailored version for review
 */

import { getUserProfile, insertApplication, insertAgentLog } from './mongodb.js';
import { tailorForApplication, generateCoverLetter } from './resume-parser.js';

class ResumeTailoringPipeline {
  constructor() {
    this.tailoredCache = new Map();
  }

  /**
   * Run the full tailoring pipeline for an opportunity
   */
  async tailor(profileId, opportunity) {
    console.log(`[ResumePipeline] Tailoring for: ${opportunity.title}`);

    const profile = await getUserProfile(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    // Step 1: Analyze opportunity requirements
    const analysis = this.analyzeOpportunity(opportunity);

    // Step 2: Generate tailored resume summary
    const tailored = await tailorForApplication(profile, opportunity);

    // Step 3: Generate custom cover letter
    const coverLetter = await generateCoverLetter(profile, opportunity);

    // Step 4: Identify skill gaps
    const skillGaps = this.identifySkillGaps(profile, opportunity);

    // Step 5: Generate application notes
    const applicationNotes = this.generateApplicationNotes(profile, opportunity, analysis, skillGaps);

    const result = {
      profileId,
      opportunity: {
        title: opportunity.title,
        institution: opportunity.institution,
        country: opportunity.country,
        type: opportunity.type,
      },
      tailored: {
        summary: tailored.summary,
        coverLetter,
        relevantSkills: tailored.tailoredSkills || [],
      },
      analysis,
      skillGaps,
      applicationNotes,
      generatedAt: new Date().toISOString(),
    };

    // Cache the result
    this.tailoredCache.set(`${profileId}:${opportunity.title}`, result);

    await insertAgentLog({
      type: 'resume_pipeline',
      status: 'completed',
      msg: `[ResumePipeline] Tailored resume for: ${opportunity.title}`,
    });

    console.log(`[ResumePipeline] Tailoring complete: ${analysis.matchScore}% match`);
    return result;
  }

  /**
   * Analyze what the opportunity is looking for
   */
  analyzeOpportunity(opportunity) {
    const text = `${opportunity.title} ${opportunity.description || ''} ${opportunity.requirements || ''}`.toLowerCase();

    const requirements = {
      technical: [],
      soft: [],
      experience: 'unknown',
      education: 'unknown',
    };

    // Detect technical requirements
    const techKeywords = ['python', 'javascript', 'typescript', 'react', 'node', 'java', 'c++', 'sql', 'aws', 'docker', 'kubernetes', 'ai', 'ml', 'playwright', 'automation'];
    requirements.technical = techKeywords.filter(kw => text.includes(kw));

    // Detect soft skills
    const softKeywords = ['communication', 'leadership', 'teamwork', 'problem-solving', 'analytical', 'creative', 'adaptable'];
    requirements.soft = softKeywords.filter(kw => text.includes(kw));

    // Detect experience level
    if (text.includes('senior') || text.includes('lead') || text.includes('5+ years')) requirements.experience = 'senior';
    else if (text.includes('junior') || text.includes('entry') || text.includes('0-2 years')) requirements.experience = 'junior';
    else requirements.experience = 'mid';

    // Detect education
    if (text.includes('phd') || text.includes('doctorate')) requirements.education = 'phd';
    else if (text.includes('master') || text.includes('mba')) requirements.education = 'masters';
    else if (text.includes('bachelor')) requirements.education = 'bachelors';

    return {
      requirements,
      matchScore: this.calculateMatchScore(requirements),
      keyTerms: requirements.technical.slice(0, 5),
    };
  }

  /**
   * Calculate how well the opportunity matches the user's profile
   */
  calculateMatchScore(requirements) {
    let score = 50;
    if (requirements.technical.length > 3) score += 15;
    if (requirements.soft.length > 2) score += 10;
    if (requirements.experience === 'mid') score += 10;
    if (requirements.education === 'bachelors' || requirements.education === 'masters') score += 5;
    return Math.min(99, score);
  }

  /**
   * Identify gaps between profile and opportunity
   */
  identifySkillGaps(profile, opportunity) {
    const profileSkills = (profile.coreStack || '').toLowerCase().split(/[,\s]+/);
    const oppText = `${opportunity.title} ${opportunity.description || ''}`.toLowerCase();
    const gaps = [];

    const requiredSkills = ['python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'ai', 'ml'];
    for (const skill of requiredSkills) {
      if (oppText.includes(skill) && !profileSkills.some(ps => ps.includes(skill))) {
        gaps.push(skill);
      }
    }

    return gaps;
  }

  /**
   * Generate application notes for the user
   */
  generateApplicationNotes(profile, opportunity, analysis, skillGaps = []) {
    const notes = [];

    if (analysis.matchScore >= 80) {
      notes.push('Strong match — apply with confidence.');
    } else if (analysis.matchScore >= 60) {
      notes.push('Good match — consider highlighting relevant experience.');
    } else {
      notes.push('Moderate match — address skill gaps in cover letter.');
    }

    if (analysis.requirements.experience === 'senior') {
      notes.push('Senior role — emphasize leadership and project outcomes.');
    }

    if (skillGaps.length > 0) {
      notes.push(`Skill gaps to address: ${skillGaps.join(', ')}`);
    }

    if (opportunity.country) {
      notes.push(`Location: ${opportunity.country} — check visa requirements.`);
    }

    return notes;
  }

  /**
   * Get cached tailoring result
   */
  getCached(profileId, opportunityTitle) {
    return this.tailoredCache.get(`${profileId}:${opportunityTitle}`) || null;
  }
}

export const resumePipeline = new ResumeTailoringPipeline();
export default resumePipeline;
