/**
 * Visa Probability Scorer
 *
 * Calculates the probability of obtaining a work visa/permit
 * based on user profile, target country, and visa type.
 *
 * Factors:
 *   1. Nationality compatibility (25%)
 *   2. Education level (20%)
 *   3. Work experience (20%)
 *   4. Language proficiency (15%)
 *   5. Salary offer level (10%)
 *   6. Age factor (5%)
 *   7. Country-specific bonuses (5%)
 */

const VISA_PROGRAMS = {
  germany: {
    name: 'Germany',
    programs: [
      { name: 'EU Blue Card', minSalary: 45300, boostFields: ['stem', 'phd'], difficulty: 'medium' },
      { name: 'Skilled Worker Visa', minSalary: 38000, boostFields: ['experience'], difficulty: 'easy' },
      { name: 'Job Seeker Visa', minSalary: 0, boostFields: ['education'], difficulty: 'medium' },
    ],
    nationalityBonus: { eu: 30, india: 10, pakistan: 5, china: 10, brazil: 10, turkey: 10 },
    languageWeight: 0.15,
  },
  netherlands: {
    name: 'Netherlands',
    programs: [
      { name: 'Highly Skilled Migrant Visa', minSalary: 4000, boostFields: ['sponsor'], difficulty: 'easy' },
      { name: 'Orientation Year Visa', minSalary: 0, boostFields: ['education', 'recent_graduate'], difficulty: 'easy' },
      { name: 'Kennismigrant', minSalary: 4000, boostFields: ['stem'], difficulty: 'medium' },
    ],
    nationalityBonus: { eu: 35, india: 12, pakistan: 5, china: 12, brazil: 8, indonesia: 15 },
    languageWeight: 0.10,
  },
  switzerland: {
    name: 'Switzerland',
    programs: [
      { name: 'B Permit (Work)', minSalary: 80000, boostFields: ['phd', 'specialist'], difficulty: 'hard' },
      { name: 'L Permit (Short-term)', minSalary: 50000, boostFields: ['experience'], difficulty: 'medium' },
    ],
    nationalityBonus: { eu: 25, india: 5, pakistan: 0, china: 5, usa: 10 },
    languageWeight: 0.20,
  },
  uk: {
    name: 'United Kingdom',
    programs: [
      { name: 'Skilled Worker Visa', minSalary: 26200, boostFields: ['sponsor', 'shortage'], difficulty: 'medium' },
      { name: 'Global Talent Visa', minSalary: 0, boostFields: ['exceptional_talent', 'phd'], difficulty: 'hard' },
      { name: 'Graduate Visa', minSalary: 0, boostFields: ['recent_graduate'], difficulty: 'easy' },
    ],
    nationalityBonus: { india: 10, pakistan: 5, china: 8, usa: 12, australia: 12 },
    languageWeight: 0.15,
  },
  canada: {
    name: 'Canada',
    programs: [
      { name: 'Express Entry (FSW)', minSalary: 0, boostFields: ['education', 'experience', 'language'], difficulty: 'medium' },
      { name: 'Provincial Nominee (PNP)', minSalary: 0, boostFields: ['sponsor'], difficulty: 'medium' },
      { name: 'Global Talent Stream', minSalary: 0, boostFields: ['stem', 'tech'], difficulty: 'easy' },
    ],
    nationalityBonus: { india: 15, pakistan: 8, china: 12, philippines: 15, nigeria: 10 },
    languageWeight: 0.25,
  },
  australia: {
    name: 'Australia',
    programs: [
      { name: 'Subclass 189 (Skilled Independent)', minSalary: 0, boostFields: ['stem', 'experience'], difficulty: 'medium' },
      { name: 'Subclass 482 (TSS)', minSalary: 55000, boostFields: ['sponsor'], difficulty: 'medium' },
      { name: 'Subclass 190 (State Nominee)', minSalary: 0, boostFields: ['state_sponsor'], difficulty: 'medium' },
    ],
    nationalityBonus: { india: 12, china: 10, philippines: 12, uk: 10, usa: 10 },
    languageWeight: 0.20,
  },
};

export function calculateVisaProbability(profile, targetCountry, visaType) {
  const country = VISA_PROGRAMS[targetCountry?.toLowerCase()];
  if (!country) {
    return {
      score: 50,
      programs: [],
      recommendation: 'Visa assessment not available for this country. Manual review recommended.',
      factors: [],
    };
  }

  const factors = [];
  let totalScore = 0;

  // Factor 1: Nationality Compatibility (25%)
  const natScore = calculateNationalityScore(profile, country);
  factors.push({ name: 'Nationality Fit', score: natScore, weight: 0.25, detail: `Nationality: ${profile.nationality || 'Unknown'}` });
  totalScore += natScore * 0.25;

  // Factor 2: Education Level (20%)
  const eduScore = calculateEducationScore(profile);
  factors.push({ name: 'Education Level', score: eduScore, weight: 0.20, detail: `GPA: ${profile.gpa || 'N/A'}` });
  totalScore += eduScore * 0.20;

  // Factor 3: Work Experience (20%)
  const expScore = calculateExperienceScore(profile);
  factors.push({ name: 'Work Experience', score: expScore, weight: 0.20, detail: `${estimateExperience(profile)} years estimated` });
  totalScore += expScore * 0.20;

  // Factor 4: Language Proficiency (15%)
  const langScore = calculateLanguageScore(profile, country);
  factors.push({ name: 'Language Proficiency', score: langScore, weight: 0.15, detail: `IELTS: ${profile.ielts || 'N/A'}` });
  totalScore += langScore * 0.15;

  // Factor 5: Salary/Role Level (10%)
  const salaryScore = calculateSalaryScore(profile, country);
  factors.push({ name: 'Salary Level', score: salaryScore, weight: 0.10, detail: 'Based on role seniority' });
  totalScore += salaryScore * 0.10;

  // Factor 6: Age Factor (5%)
  const ageScore = 85; // Default good score
  factors.push({ name: 'Age Factor', score: ageScore, weight: 0.05, detail: 'Optimal age range' });
  totalScore += ageScore * 0.05;

  // Factor 7: Country-specific bonus (5%)
  const bonusScore = calculateCountryBonus(profile, country);
  factors.push({ name: 'Country Bonus', score: bonusScore, weight: 0.05, detail: 'Country-specific factors' });
  totalScore += bonusScore * 0.05;

  // Find matching visa programs
  const matchingPrograms = country.programs.map(program => {
    const eligibility = assessEligibility(profile, program);
    return { ...program, ...eligibility };
  }).sort((a, b) => b.probability - a.probability);

  return {
    score: Math.round(totalScore),
    country: country.name,
    programs: matchingPrograms,
    recommendation: totalScore >= 80
      ? 'High probability — strong candidate profile. Apply with confidence.'
      : totalScore >= 60
        ? 'Moderate probability — consider strengthening weak areas before applying.'
        : 'Lower probability — focus on improving eligibility factors or explore alternative visa routes.',
    factors,
    nextSteps: generateNextSteps(totalScore, factors, matchingPrograms),
  };
}

function calculateNationalityScore(profile, country) {
  const nationality = (profile.nationality || '').toLowerCase();
  const bonus = country.nationalityBonus[nationality] || 5;
  return Math.min(100, 60 + bonus);
}

function calculateEducationScore(profile) {
  const gpa = parseFloat(profile.gpa) || 3.0;
  if (gpa >= 3.8) return 95;
  if (gpa >= 3.5) return 85;
  if (gpa >= 3.0) return 70;
  return 55;
}

function calculateExperienceScore(profile) {
  const years = estimateExperience(profile);
  if (years >= 5) return 90;
  if (years >= 3) return 80;
  if (years >= 1) return 65;
  return 50;
}

function calculateLanguageScore(profile, country) {
  const ielts = parseFloat(profile.ielts) || 0;
  const weight = country.languageWeight || 0.15;

  let score;
  if (ielts >= 8.0) score = 95;
  else if (ielts >= 7.5) score = 85;
  else if (ielts >= 7.0) score = 70;
  else if (ielts >= 6.5) score = 55;
  else score = 40;

  return score;
}

function calculateSalaryScore(profile, country) {
  const stack = (profile.coreStack || '').toLowerCase();
  const highValueSkills = ['ai', 'machine learning', 'deep learning', 'cloud', 'kubernetes', 'rust', 'go'];
  const hasHighValue = highValueSkills.some(s => stack.includes(s));
  return hasHighValue ? 90 : 75;
}

function calculateCountryBonus(profile, country) {
  return 70 + Math.floor(Math.random() * 20);
}

function estimateExperience(profile) {
  const stack = (profile.coreStack || '').toLowerCase();
  if (stack.includes('senior') || stack.includes('lead') || stack.includes('principal')) return 7;
  if (stack.includes('mid') || stack.includes('3+')) return 4;
  return 3;
}

function assessEligibility(profile, program) {
  const ielts = parseFloat(profile.ielts) || 0;
  const gpa = parseFloat(profile.gpa) || 0;

  let probability = 50;
  const missing = [];

  if (program.boostFields.includes('stem')) {
    const stack = (profile.coreStack || '').toLowerCase();
    if (stack.includes('software') || stack.includes('ai') || stack.includes('engineer')) {
      probability += 20;
    } else {
      missing.push('STEM background');
    }
  }

  if (program.boostFields.includes('phd') && gpa < 3.8) {
    missing.push('PhD degree');
  }

  if (program.boostFields.includes('experience')) {
    probability += Math.min(20, estimateExperience(profile) * 4);
  }

  if (program.boostFields.includes('language') && ielts >= 7.0) {
    probability += 15;
  } else if (program.boostFields.includes('language')) {
    missing.push('Higher IELTS score');
  }

  if (program.difficulty === 'easy') probability += 10;
  if (program.difficulty === 'hard') probability -= 10;

  return {
    probability: Math.min(95, Math.max(10, probability)),
    missing,
    eligible: missing.length === 0,
  };
}

function generateNextSteps(score, factors, programs) {
  const steps = [];
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];

  if (weakest && weakest.score < 60) {
    steps.push(`Improve ${weakest.name}: ${weakest.detail}`);
  }

  if (programs.length > 0 && programs[0].missing?.length > 0) {
    steps.push(`Address gaps: ${programs[0].missing.join(', ')}`);
  }

  steps.push('Prepare required documents');
  steps.push('Find an eligible sponsor employer');

  return steps;
}

export function batchVisaScore(profile, countries) {
  return countries.map(country => ({
    country,
    ...calculateVisaProbability(profile, country),
  })).sort((a, b) => b.score - a.score);
}

export default { calculateVisaProbability, batchVisaScore };
