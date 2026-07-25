import { NextResponse } from 'next/server';
import { extractKeywords, matchKeywords } from '../../../../lib/seo/keyword-extractor.js';
import { scoreResumeATS } from '../../../../lib/seo/ats-scorer.js';
import { analyzeLinkedIn } from '../../../../lib/seo/linkedin-optimizer.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, contentType, targetKeywords, profile } = body;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'content is required',
      }, { status: 400 });
    }

    const result = {};

    // Extract keywords from content
    const keywords = extractKeywords(content);
    result.keywords = keywords;

    // ATS scoring if it's a resume
    if (contentType === 'resume' || contentType === 'cover_letter') {
      result.atsScore = scoreResumeATS(content);
    }

    // LinkedIn analysis
    if (contentType === 'linkedin' && profile) {
      result.linkedinAnalysis = analyzeLinkedIn(profile);
    }

    // Keyword matching
    if (targetKeywords && targetKeywords.length > 0) {
      const matched = matchKeywords(content, targetKeywords);
      result.keywordMatch = matched;
    }

    // Readability
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    result.readability = {
      totalWords: words.length,
      totalSentences: sentences.length,
      avgWordsPerSentence: Math.round(words.length / Math.max(sentences.length, 1)),
      readingTimeMinutes: Math.round(words.length / 200),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[SEO Analyze API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
