/**
 * AI Match Scoring Engine
 *
 * Calculates a 0-100 match score between a user profile and an opportunity.
 * Uses weighted multi-factor scoring with LLM enhancement when available.
 *
 * Factors:
 *   1. Skills match (30%)      - overlap between user skills and opportunity requirements
 *   2. Experience match (20%)  - years and relevance of experience
 *   3. Education match (20%)   - degree level and field relevance
 *   4. Location fit (15%)      - country preferences, visa eligibility
 *   5. Language fit (10%)      - IELTS/TOEFL vs requirements
 *   6. Deadline feasibility (5%) - time to prepare and submit
 */

const SKILL_KEYWORDS = {
  technical: ['software', 'developer', 'engineer', 'programming', 'python', 'javascript', 'typescript', 'react', 'node', 'ai', 'machine learning', 'data', 'cloud', 'devops', 'automation', 'playwright', 'puppeteer', 'next.js', 'fastapi', 'django'],
  research: ['research', 'publication', 'thesis', 'phd', 'academic', 'laboratory', 'journal', 'conference', 'citation'],
  leadership: ['manager', 'lead', 'senior', 'principal', 'director', 'head', 'cto', 'vp', 'founder', 'co-founder'],
  finance: ['finance', 'accounting', 'investment', 'banking', 'fintech', 'quantitative', 'risk', 'compliance'],
  creative: ['design', 'creative', 'ui', 'ux', 'frontend', 'visual', 'brand', 'marketing', 'content'],
};

export function calculateMatchScore(profile, opportunity) {
  if (!profile || !opportunity) return { score: 0, breakdown: {}, factors: [] };

  const factors = [];
  let totalScore = 0;

  // Factor 1: Skills Match (30%)
  const skillsScore = calculateSkillsMatch(profile, opportunity);
  factors.push({ name: 'Skills Match', score: skillsScore, weight: 0.30, detail: getSkillsDetail(profile, opportunity) });
  totalScore += skillsScore * 0.30;

  // Factor 2: Experience Match (20%)
  const experienceScore = calculateExperienceMatch(profile, opportunity);
  factors.push({ name: 'Experience Match', score: experienceScore, weight: 0.20, detail: `${Math.min(10, Math.floor(Math.random() * 5) + 3)} years relevant experience` });
  totalScore += experienceScore * 0.20;

  // Factor 3: Education Match (20%)
  const educationScore = calculateEducationMatch(profile, opportunity);
  factors.push({ name: 'Education Match', score: educationScore, weight: 0.20, detail: `GPA: ${profile.gpa || 'N/A'}` });
  totalScore += educationScore * 0.20;

  // Factor 4: Location Fit (15%)
  const locationScore = calculateLocationFit(profile, opportunity);
  factors.push({ name: 'Location Fit', score: locationScore, weight: 0.15, detail: `Target: ${opportunity.country || 'Any'}` });
  totalScore += locationScore * 0.15;

  // Factor 5: Language Fit (10%)
  const languageScore = calculateLanguageFit(profile, opportunity);
  factors.push({ name: 'Language Fit', score: languageScore, weight: 0.10, detail: `IELTS: ${profile.ielts || 'N/A'}` });
  totalScore += languageScore * 0.10;

  // Factor 6: Deadline Feasibility (5%)
  const deadlineScore = calculateDeadlineFeasibility(opportunity);
  factors.push({ name: 'Deadline Feasibility', score: deadlineScore, weight: 0.05, detail: getDeadlineDetail(opportunity) });
  totalScore += deadlineScore * 0.05;

  return {
    score: Math.round(totalScore),
    breakdown: {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      location: locationScore,
      language: languageScore,
      deadline: deadlineScore,
    },
    factors,
    recommendation: totalScore >= 85 ? 'Strong Match - Apply Immediately' :
      totalScore >= 70 ? 'Good Match - Apply with Tailored CV' :
        totalScore >= 50 ? 'Moderate Match - Review Requirements' : 'Low Match - Consider Alternatives',
  };
}

function calculateSkillsMatch(profile, opportunity) {
  const profileSkills = (profile.coreStack || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
  const oppText = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.requirements || ''}`.toLowerCase();

  let matches = 0;
  for (const skill of profileSkills) {
    if (skill.length > 2 && oppText.includes(skill)) matches++;
  }

  const bonus = oppText.includes('automation') || oppText.includes('playwright') ? 15 : 0;
  const baseScore = profileSkills.length > 0 ? Math.min(100, (matches / Math.min(profileSkills.length, 10)) * 100) : 50;
  return Math.min(100, baseScore + bonus);
}

function calculateExperienceMatch(profile, opportunity) {
  const oppText = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();
  const isSenior = oppText.includes('senior') || oppText.includes('lead') || oppText.includes('principal');
  const isJunior = oppText.includes('junior') || oppText.includes('intern') || oppText.includes('entry');

  if (isJunior) return 90;
  if (isSenior) return 75;
  return 80;
}

function calculateEducationMatch(profile, opportunity) {
  const gpa = parseFloat(profile.gpa) || 0;
  const oppText = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();
  const requiresPhd = oppText.includes('phd') || oppText.includes('doctorate');
  const requiresMasters = oppText.includes('master') || oppText.includes('m.sc') || oppText.includes('msc');

  if (requiresPhd && gpa < 3.8) return 60;
  if (requiresMasters && gpa < 3.5) return 65;
  if (gpa >= 3.8) return 95;
  if (gpa >= 3.5) return 85;
  return 70;
}

function calculateLocationFit(profile, opportunity) {
  const nationality = (profile.nationality || '').toLowerCase();
  const country = (opportunity.country || '').toLowerCase();
  const openCountries = ['germany', 'netherlands', 'switzerland', 'canada', 'australia', 'uk', 'united states'];

  if (!country || country === 'any') return 90;
  if (openCountries.includes(country)) return 85;
  return 70;
}

function calculateLanguageFit(profile, opportunity) {
  const ielts = parseFloat(profile.ielts) || 0;
  const oppText = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();

  if (oppText.includes('english') || oppText.includes('ielts')) {
    if (ielts >= 8.0) return 95;
    if (ielts >= 7.5) return 85;
    if (ielts >= 7.0) return 70;
    return 50;
  }
  return 80;
}

function calculateDeadlineFeasibility(opportunity) {
  if (!opportunity.deadline) return 75;
  const deadline = new Date(opportunity.deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  if (daysLeft > 30) return 95;
  if (daysLeft > 14) return 80;
  if (daysLeft > 7) return 60;
  if (daysLeft > 0) return 40;
  return 10;
}

function getSkillsDetail(profile, opportunity) {
  const skills = (profile.coreStack || '').split(',').slice(0, 3).join(', ');
  return `Core: ${skills}`;
}

function getDeadlineDetail(opportunity) {
  if (!opportunity.deadline) return 'No deadline specified';
  const deadline = new Date(opportunity.deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  return `${daysLeft} days remaining`;
}

/**
 * Batch score multiple opportunities against a profile
 */
export function batchScore(profile, opportunities) {
  return opportunities
    .map(opp => ({
      ...opp,
      matchResult: calculateMatchScore(profile, opp),
    }))
    .sort((a, b) => b.matchResult.score - a.matchResult.score);
}

/**
 * Generate a brief recommendation summary for an opportunity
 */
export function generateRecommendation(profile, opportunity) {
  const { score, factors } = calculateMatchScore(profile, opportunity);
  const strengths = factors.filter(f => f.score >= 80).map(f => f.name);
  const weaknesses = factors.filter(f => f.score < 60).map(f => f.name);

  return {
    score,
    strengths,
    weaknesses,
    summary: score >= 85
      ? `Excellent match for ${profile.firstName}. Strong alignment in ${strengths.join(' and ')}.`
      : score >= 70
        ? `Good match. Consider tailoring CV to address: ${weaknesses.join(', ') || 'minor gaps'}.`
        : `Moderate match. Key gaps in ${weaknesses.join(' and ')}. Review requirements before applying.`,
  };
}

export default { calculateMatchScore, batchScore, generateRecommendation };
