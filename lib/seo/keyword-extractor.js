/**
 * Keyword Extractor
 *
 * Extracts high-impact keywords from job descriptions using
 * TF-IDF-like frequency analysis and industry-specific patterns.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'this',
  'that', 'these', 'those', 'it', 'its', 'we', 'our', 'you', 'your',
  'they', 'their', 'what', 'which', 'who', 'whom', 'how', 'when',
  'where', 'why', 'if', 'then', 'than', 'so', 'no', 'not', 'only',
  'own', 'same', 'than', 'too', 'very', 'just', 'about', 'above',
  'after', 'again', 'all', 'also', 'any', 'because', 'before',
  'between', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'into', 'through', 'during', 'out', 'up', 'down', 'off',
  'over', 'under', 'further', 'here', 'there', 'once', 'while',
]);

const TECH_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'node', 'nodejs', 'vue', 'angular',
  'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
  'git', 'github', 'gitlab', 'bitbucket',
  'ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'llm', 'gpt', 'claude',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'playwright', 'puppeteer', 'selenium', 'cypress',
  'rest', 'graphql', 'grpc', 'api', 'microservices',
  'agile', 'scrum', 'jira', 'confluence',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
  'linux', 'bash', 'shell', 'powershell',
  'nextjs', 'next.js', 'express', 'fastapi', 'django', 'flask', 'spring',
  'blockchain', 'web3', 'solidity',
  'devops', 'ci/cd', 'monitoring', 'grafana', 'prometheus',
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'problem-solving', 'analytical',
  'creative', 'adaptable', 'organized', 'detail-oriented', 'time management',
  'critical thinking', 'collaboration', 'mentoring', 'presenting', 'negotiation',
];

const JOB_LEVELS = {
  junior: ['junior', 'entry', 'intern', 'associate', 'trainee', 'graduate', '0-2 years', '0-3 years'],
  mid: ['mid-level', 'intermediate', '3-5 years', '3+ years', '5+ years'],
  senior: ['senior', 'lead', 'principal', 'staff', 'architect', '5+ years', '7+ years', '10+ years'],
  executive: ['director', 'vp', 'head', 'cto', 'ceo', 'cfo', 'chief', 'executive'],
};

export function extractKeywords(text) {
  if (!text) return { technical: [], soft: [], all: [], level: 'mid' };

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s\+\#\.]/g, ' ');
  const words = normalized.split(/\s+/).filter(w => w.length > 1);

  // Word frequency
  const freq = {};
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    freq[word] = (freq[word] || 0) + 1;
  }

  // Detect technical skills
  const technical = [];
  for (const skill of TECH_SKILLS) {
    if (normalized.includes(skill)) {
      technical.push({
        keyword: skill,
        frequency: freq[skill] || 1,
        importance: normalized.indexOf(skill) < normalized.length * 0.3 ? 'high' : 'medium',
      });
    }
  }

  // Detect soft skills
  const soft = [];
  for (const skill of SOFT_SKILLS) {
    if (normalized.includes(skill)) {
      soft.push({ keyword: skill, frequency: 1, importance: 'medium' });
    }
  }

  // Detect job level
  let level = 'mid';
  for (const [lvl, keywords] of Object.entries(JOB_LEVELS)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      level = lvl;
      break;
    }
  }

  // Top keywords by frequency
  const all = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([keyword, frequency]) => ({ keyword, frequency, importance: frequency > 2 ? 'high' : 'medium' }));

  return {
    technical: technical.sort((a, b) => b.frequency - a.frequency),
    soft,
    all,
    level,
    totalWords: words.length,
    uniqueWords: Object.keys(freq).length,
  };
}

export function matchKeywords(profileSkills, jobKeywords) {
  const profileLower = (profileSkills || '').toLowerCase();
  const matched = [];
  const missing = [];

  for (const kw of jobKeywords) {
    const keyword = typeof kw === 'string' ? kw : kw.keyword;
    if (profileLower.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchRate = jobKeywords.length > 0
    ? Math.round((matched.length / jobKeywords.length) * 100)
    : 0;

  return { matched, missing, matchRate };
}

export function suggestKeywordPlacement(missingKeywords, profile) {
  const suggestions = [];

  for (const keyword of missingKeywords) {
    const isTech = TECH_SKILLS.includes(keyword);
    const profileText = `${profile.coreStack || ''} ${profile.bio || ''}`.toLowerCase();

    if (isTech && !profileText.includes(keyword)) {
      suggestions.push({
        keyword,
        placement: 'coreStack',
        reason: `Add "${keyword}" to your skills section — it's a technical requirement.`,
        priority: 'high',
      });
    } else if (!profileText.includes(keyword)) {
      suggestions.push({
        keyword,
        placement: 'bio',
        reason: `Mention "${keyword}" in your professional summary to improve keyword matching.`,
        priority: 'medium',
      });
    }
  }

  return suggestions;
}
