/**
 * ATS (Applicant Tracking System) Scorer
 *
 * Scores resumes against ATS parsing requirements.
 * Most large companies use ATS to filter resumes before human review.
 *
 * Scoring factors:
 *   - Section headers (Education, Experience, Skills)
 *   - Date formatting consistency
 *   - Contact info completeness
 *   - Keyword density
 *   - File format compatibility
 *   - ATS-breaking elements detection
 *   - Length and structure
 */

const REQUIRED_SECTIONS = [
  'experience', 'education', 'skills', 'summary', 'objective',
  'work history', 'employment', 'technical skills', 'proficiencies',
];

const ATS_BREAKING_PATTERNS = [
  { pattern: /\|/g, issue: 'Pipe characters may confuse ATS parsers', severity: 'medium' },
  { pattern: /\t/g, issue: 'Tab characters can break ATS formatting', severity: 'low' },
  { pattern: /<<(?!email|phone|link)/g, issue: 'Unusual bracket patterns detected', severity: 'low' },
  { pattern: /class="/g, issue: 'HTML class attributes found — ensure plain text version', severity: 'high' },
  { pattern: /\btable\b/gi, issue: 'Tables are poorly parsed by most ATS systems', severity: 'high' },
  { pattern: /\bheader\b.*\bfooter\b/gi, issue: 'Headers/footers are ignored by ATS', severity: 'medium' },
  { pattern: /\bcolumn\b/gi, issue: 'Multi-column layouts may not parse correctly', severity: 'medium' },
];

const ACTION_VERBS = [
  'achieved', 'accelerated', 'administered', 'automated', 'built', 'led',
  'managed', 'developed', 'implemented', 'improved', 'increased', 'reduced',
  'launched', 'optimized', 'delivered', 'designed', 'created', 'established',
  'generated', 'resolved', 'streamlined', 'supervised', 'trained', 'negotiated',
  'orchestrated', 'pioneered', 'revamped', 'spearheaded', 'transformed',
];

export function scoreResumeATS(resumeText) {
  if (!resumeText) return { score: 0, issues: [], sections: {} };

  const text = resumeText.toLowerCase();
  const issues = [];
  let score = 100;

  // 1. Check for required sections (25 points)
  const sections = {};
  let sectionsFound = 0;
  for (const section of REQUIRED_SECTIONS) {
    const found = text.includes(section);
    sections[section] = found;
    if (found) sectionsFound++;
  }
  const sectionScore = Math.round((sectionsFound / REQUIRED_SECTIONS.length) * 25);
  if (sectionsFound < 3) {
    issues.push({
      type: 'sections',
      message: `Only ${sectionsFound} ATS-friendly section headers found. Add: Experience, Education, Skills.`,
      severity: 'high',
      pointsDeducted: 25 - sectionScore,
    });
  }
  score -= (25 - sectionScore);

  // 2. Check for ATS-breaking elements (20 points max deduction)
  let breakingCount = 0;
  for (const { pattern, issue, severity } of ATS_BREAKING_PATTERNS) {
    if (pattern.test(resumeText)) {
      breakingCount++;
      const deduction = severity === 'high' ? 10 : severity === 'medium' ? 5 : 2;
      score -= deduction;
      issues.push({ type: 'formatting', message: issue, severity, pointsDeducted: deduction });
    }
  }

  // 3. Check contact info (15 points)
  const hasEmail = /\b[\w.-]+@[\w.-]+\.\w+\b/.test(resumeText);
  const hasPhone = /[\+]?[\d\s\-\(\)]{7,}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com/.test(text);
  const hasGitHub = /github\.com/.test(text);

  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0) + (hasLinkedIn ? 3 : 0) + (hasGitHub ? 2 : 0);
  score -= (15 - contactScore);

  if (!hasEmail) issues.push({ type: 'contact', message: 'No email address found', severity: 'high', pointsDeducted: 5 });
  if (!hasPhone) issues.push({ type: 'contact', message: 'No phone number found', severity: 'high', pointsDeducted: 5 });

  // 4. Check keyword density (20 points)
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const totalWords = words.length;

  if (totalWords < 200) {
    score -= 15;
    issues.push({ type: 'length', message: 'Resume is too short (< 200 words). ATS prefers 400-800 words.', severity: 'high', pointsDeducted: 15 });
  } else if (totalWords < 400) {
    score -= 5;
    issues.push({ type: 'length', message: 'Resume could be longer. Aim for 400-800 words for optimal ATS parsing.', severity: 'medium', pointsDeducted: 5 });
  } else if (totalWords > 1200) {
    score -= 5;
    issues.push({ type: 'length', message: 'Resume is very long. Consider condensing to 600-900 words.', severity: 'low', pointsDeducted: 5 });
  }

  // 5. Check for action verbs (10 points)
  const actionVerbCount = ACTION_VERBS.filter(v => text.includes(v)).length;
  if (actionVerbCount < 3) {
    score -= 10;
    issues.push({ type: 'language', message: 'Use more action verbs (led, built, automated, improved, etc.)', severity: 'medium', pointsDeducted: 10 });
  } else if (actionVerbCount < 6) {
    score -= 5;
    issues.push({ type: 'language', message: 'Consider adding more action verbs to strengthen impact', severity: 'low', pointsDeducted: 5 });
  }

  // 6. Check date consistency (10 points)
  const datePatterns = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}\b/gi) || [];
  const yearPatterns = text.match(/\b(19|20)\d{2}\b/g) || [];
  if (datePatterns.length === 0 && yearPatterns.length === 0) {
    score -= 10;
    issues.push({ type: 'dates', message: 'No dates found. Include dates for experience and education.', severity: 'high', pointsDeducted: 10 });
  } else if (datePatterns.length > 0 && yearPatterns.length > 0) {
    // Mixed formats
    const format1 = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}\b/gi) || [];
    const format2 = text.match(/\b\d{1,2}\/\d{4}\b/g) || [];
    if (format1.length > 0 && format2.length > 0) {
      score -= 5;
      issues.push({ type: 'dates', message: 'Mixed date formats detected. Use consistent formatting.', severity: 'medium', pointsDeducted: 5 });
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    sections,
    stats: {
      totalWords,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHub,
      sectionsFound,
      actionVerbCount,
      datesFound: datePatterns.length + yearPatterns.length,
    },
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
    recommendation: score >= 85
      ? 'Excellent ATS compatibility. Your resume should pass automated screening.'
      : score >= 70
        ? 'Good ATS compatibility with minor issues. Address the suggestions above.'
        : score >= 50
          ? 'Moderate ATS issues detected. Fix high-severity problems to improve pass rate.'
          : 'Significant ATS problems. Your resume may be filtered out by automated systems.',
  };
}
