/**
 * LinkedIn Profile Optimizer
 *
 * Analyzes and optimizes LinkedIn profiles for recruiter search visibility.
 *
 * Optimization areas:
 *   - Headline (keyword-rich, not just job title)
 *   - About/Summary (story-driven, keyword-optimized)
 *   - Experience bullets (action verbs, metrics, keywords)
 *   - Skills section (relevant, prioritized)
 *   - Recommendations (social proof)
 *   - Custom URL
 */

const HEADLINE_FORMULAS = [
  '{Role} | {KeySkill1} | {KeySkill2} | {ValueProposition}',
  '{Role} Helping {TargetAudience} Achieve {Outcome}',
  '{Role} | {Industry} | {Specialization}',
  '{Adjective} {Role} | {Skill} | {Metric}',
];

const ABOUT_STARTERS = [
  'Passionate about {domain} with {years}+ years of experience in {skills}.',
  '{role} with a proven track record of {achievement}.',
  'I help {audience} {outcome} through {method}.',
];

export function analyzeLinkedIn(profile) {
  const issues = [];
  let score = 0;

  // 1. Headline Analysis (25 points)
  const headline = profile.headline || '';
  const headlineLength = headline.length;

  if (!headline) {
    issues.push({ section: 'headline', message: 'Headline is missing. This is the most important SEO element.', severity: 'high', points: 25 });
  } else {
    let headlineScore = 0;

    if (headlineLength >= 40 && headlineLength <= 220) headlineScore += 8;
    else if (headlineLength < 40) issues.push({ section: 'headline', message: `Headline too short (${headlineLength} chars). Aim for 40-220 characters.`, severity: 'medium', points: 5 });
    else issues.push({ section: 'headline', message: `Headline too long (${headlineLength} chars). Keep under 220.`, severity: 'low', points: 2 });

    if (headline.includes('|')) headlineScore += 5;
    if (/[A-Z]/.test(headline)) headlineScore += 4;
    if (headline.split(' ').length >= 5) headlineScore += 5;

    const hasRole = /\b(engineer|developer|designer|manager|analyst|scientist|architect|lead|director)\b/i.test(headline);
    if (hasRole) headlineScore += 3;

    score += Math.min(25, headlineScore);
    if (headlineScore < 15) {
      issues.push({ section: 'headline', message: 'Headline lacks keywords. Use pipe separators and include role + skills.', severity: 'medium', points: 25 - headlineScore });
    }
  }

  // 2. About/Summary Analysis (25 points)
  const about = profile.about || profile.bio || '';
  const aboutLength = about.length;

  if (!about) {
    issues.push({ section: 'about', message: 'About section is empty. Recruiters read this to assess fit.', severity: 'high', points: 25 });
  } else {
    let aboutScore = 0;

    if (aboutLength >= 100) aboutScore += 8;
    if (aboutLength >= 300) aboutScore += 5;
    if (aboutLength <= 2600) aboutScore += 5;

    const sentences = about.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 5) aboutScore += 4;
    if (sentences.length >= 10) aboutScore += 3;

    score += Math.min(25, aboutScore);
    if (aboutScore < 15) {
      issues.push({ section: 'about', message: 'About section needs more depth. Write 3-5 paragraphs with keywords.', severity: 'medium', points: 25 - aboutScore });
    }
  }

  // 3. Skills Analysis (20 points)
  const skills = profile.skills || profile.coreStack || '';
  const skillList = skills.split(/[,;]+/).map(s => s.trim()).filter(Boolean);

  if (skillList.length === 0) {
    issues.push({ section: 'skills', message: 'No skills listed. Add at least 5 relevant technical skills.', severity: 'high', points: 20 });
  } else {
    let skillsScore = 0;
    skillsScore += Math.min(15, skillList.length * 3);
    if (skillList.length >= 5) skillsScore += 5;
    score += Math.min(20, skillsScore);
  }

  // 4. Experience Analysis (20 points)
  const experience = profile.experience || '';
  if (!experience) {
    issues.push({ section: 'experience', message: 'No experience details. Add bullet points with metrics.', severity: 'high', points: 20 });
  } else {
    let expScore = 0;
    const bullets = experience.split('\n').filter(b => b.trim().length > 10);
    if (bullets.length >= 3) expScore += 10;
    if (bullets.length >= 6) expScore += 5;

    const hasMetrics = /\d+%|\$\d+|\d+ (users|customers|revenue|projects|team)/i.test(experience);
    if (hasMetrics) expScore += 5;

    score += Math.min(20, expScore);
  }

  // 5. Profile Completeness (10 points)
  const completenessChecks = [
    profile.firstName, profile.lastName, profile.email,
    profile.nationality, profile.location,
  ].filter(Boolean).length;

  score += Math.round((completenessChecks / 5) * 10);

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
    sections: {
      headline: { length: headlineLength, has: !!headline },
      about: { length: aboutLength, has: !!about },
      skills: { count: skillList.length },
      experience: { has: !!experience },
    },
  };
}

export function generateOptimizedHeadline(profile, targetRole) {
  const skills = (profile.coreStack || '').split(',').slice(0, 2);
  const role = targetRole || profile.coreStack?.split(',')[0] || 'Professional';

  return [
    `${role} | ${skills.join(' | ')} | Building the Future`,
    `${role} | ${skills[0] || 'Technology'} | Open to Opportunities`,
    `${role} Helping Teams Build Scalable Systems | ${skills.join(', ')}`,
    `${role} | ${profile.nationality || 'Global'} | ${skills[0] || 'Innovation'} Enthusiast`,
  ];
}

export function generateOptimizedAbout(profile) {
  const skills = profile.coreStack || 'technology';
  const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return `🚀 ${name} | ${skills.split(',').slice(0, 3).join(', ')}

${profile.bio || 'Passionate technology professional with a focus on building innovative solutions.'}

💡 What I bring:
• Deep expertise in ${skills}
• Proven track record of delivering impactful projects
• Strong analytical and problem-solving skills
• Collaborative approach to team success

🎯 Currently seeking opportunities in ${profile.nationality || 'global'} markets where I can contribute to cutting-edge projects and grow alongside talented teams.

📩 Let's connect — I'm always open to discussing ${skills.split(',').slice(0, 2).join(', ')} and new opportunities.`;
}

export function optimizeExperienceBullets(experience) {
  if (!experience) return [];

  const lines = experience.split('\n').filter(l => l.trim().length > 0);
  return lines.map(line => {
    let optimized = line.trim();
    if (!optimized.startsWith('•') && !optimized.startsWith('-') && !optimized.startsWith('*')) {
      optimized = `• ${optimized}`;
    }
    return optimized;
  });
}
