import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url, pageContent, keywords, competitors } = await req.json();

    const analysis = analyzeSEO(pageContent || '', keywords || []);
    const recommendations = generateRecommendations(analysis);
    const structuredData = generateStructuredData(url || '', pageContent || '');

    return NextResponse.json({
      success: true,
      data: {
        score: analysis.score,
        analysis,
        recommendations,
        structuredData,
        autoFixes: generateAutoFixes(analysis),
        meta: {
          analyzedAt: new Date().toISOString(),
          url: url || 'current-page',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const defaultConfig = {
      siteName: 'AI Career Copilot',
      siteUrl: 'https://ai-career-copilot.vercel.app',
      defaultMeta: {
        title: 'AI Career Copilot - Your AI-Powered Job Application Assistant',
        description: 'Automated job applications, scholarship hunting, visa scoring, and interview preparation powered by AI agents.',
        keywords: ['AI career', 'job application', 'scholarship', 'visa', 'interview prep', 'resume optimizer'],
        ogType: 'website',
        ogImage: '/og-image.png',
        twitterCard: 'summary_large_image',
      },
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'AI Career Copilot',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'AI-powered career assistant for job applications, scholarships, and visa processes.',
      },
      sitemap: {
        enabled: true,
        routes: [
          '/', '/dashboard', '/profile', '/search', '/visa',
          '/intelligence', '/recommendations', '/deadlines',
          '/optimizer', '/salary', '/relocation', '/timeline',
          '/compare', '/coverletter', '/network', '/companies',
          '/learn', '/notes', '/documents', '/seo',
        ],
      },
      robots: {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/admin/'],
      },
    };

    return NextResponse.json({
      success: true,
      data: defaultConfig,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function analyzeSEO(content, keywords) {
  const text = content.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = sentences > 0 ? wordCount / sentences : 0;

  const keywordDensity = {};
  keywords.forEach(kw => {
    const regex = new RegExp(kw.toLowerCase(), 'gi');
    const matches = text.match(regex);
    keywordDensity[kw] = matches ? (matches.length / wordCount) * 100 : 0;
  });

  const hasHeadings = /<h[1-6]>/gi.test(content);
  const hasImages = /<img/gi.test(content);
  const hasAltTags = hasImages ? (content.match(/alt="[^"]*"/gi) || []).length : 0;
  const hasLinks = /<a\s/gi.test(content);
  const internalLinks = (content.match(/href="\/[^"]*"/gi) || []).length;
  const externalLinks = (content.match(/href="https?:\/\/[^"]*"/gi) || []).length;

  const readabilityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgSentenceLength - 20) * 3));

  let score = 50;
  if (wordCount > 300) score += 10;
  if (wordCount > 1000) score += 5;
  if (hasHeadings) score += 10;
  if (hasImages && hasAltTags > 0) score += 5;
  if (internalLinks > 2) score += 5;
  if (externalLinks > 0) score += 5;
  if (readabilityScore > 60) score += 10;
  Object.values(keywordDensity).forEach(density => {
    if (density > 0.5 && density < 3) score += 5;
  });

  return {
    score: Math.min(100, score),
    wordCount,
    sentenceCount: sentences,
    avgSentenceLength: Math.round(avgSentenceLength),
    readabilityScore: Math.round(readabilityScore),
    keywordDensity,
    hasHeadings,
    hasImages,
    hasAltTags: hasAltTags > 0,
    hasLinks,
    internalLinks,
    externalLinks,
    issues: identifyIssues(wordCount, avgSentenceLength, keywordDensity, hasHeadings),
  };
}

function identifyIssues(wordCount, avgSentenceLength, keywordDensity, hasHeadings) {
  const issues = [];
  if (wordCount < 300) issues.push({ type: 'content', severity: 'high', message: 'Content too thin. Aim for 300+ words.' });
  if (avgSentenceLength > 25) issues.push({ type: 'readability', severity: 'medium', message: 'Sentences are too long. Keep under 25 words.' });
  if (!hasHeadings) issues.push({ type: 'structure', severity: 'medium', message: 'No headings found. Add H1-H6 tags.' });
  Object.entries(keywordDensity).forEach(([kw, density]) => {
    if (density > 3) issues.push({ type: 'keyword', severity: 'medium', message: `Keyword "${kw}" overused (${density.toFixed(1)}%). Keep under 3%.` });
    if (density === 0) issues.push({ type: 'keyword', severity: 'low', message: `Keyword "${kw}" not found in content.` });
  });
  return issues;
}

function generateRecommendations(analysis) {
  const recs = [];
  if (analysis.score < 70) recs.push({ priority: 'high', action: 'Improve content depth and keyword usage', impact: '+15-25 points' });
  if (!analysis.hasHeadings) recs.push({ priority: 'high', action: 'Add heading tags (H1, H2, H3) for structure', impact: '+10 points' });
  if (!analysis.hasImages) recs.push({ priority: 'medium', action: 'Add relevant images with alt text', impact: '+5 points' });
  if (analysis.readabilityScore < 60) recs.push({ priority: 'medium', action: 'Simplify sentence structure for better readability', impact: '+5-10 points' });
  if (analysis.internalLinks < 3) recs.push({ priority: 'low', action: 'Add more internal links to related content', impact: '+5 points' });
  recs.push({ priority: 'medium', action: 'Ensure meta title is 50-60 characters', impact: '+5 points' });
  recs.push({ priority: 'medium', action: 'Write meta description of 150-160 characters', impact: '+5 points' });
  return recs;
}

function generateStructuredData(url, content) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Career Copilot',
    url: url || 'https://ai-career-copilot.vercel.app',
    applicationCategory: 'BusinessApplication',
    description: 'AI-powered career assistant for job applications, scholarships, and visa processes.',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'AI Career Copilot',
    },
  };
}

function generateAutoFixes(analysis) {
  const fixes = [];
  if (!analysis.hasHeadings) {
    fixes.push({
      type: 'add_headings',
      description: 'Add semantic heading structure',
      code: '<h1>Main Title</h1><h2>Section Title</h2><h3>Subsection</h3>',
    });
  }
  if (!analysis.hasAltTags && analysis.hasImages) {
    fixes.push({
      type: 'add_alt_tags',
      description: 'Add descriptive alt text to all images',
      code: '<img src="..." alt="Descriptive text about the image" />',
    });
  }
  return fixes;
}
