import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });

    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;

    const positiveWords = ['good', 'great', 'excellent', 'strong', 'excited', 'passionate', 'skilled', 'experienced', 'confident', 'enthusiastic', 'collaborative', 'innovative', 'achievement', 'success', 'improved', 'delivered', 'led', 'built', 'created', 'optimized'];
    const negativeWords = ['bad', 'weak', 'struggle', 'difficult', 'unfortunately', 'failed', 'poor', 'lack', 'issue', 'problem', 'concern', 'disappointed', 'frustrated', 'challenging', 'limited'];
    const formalWords = ['therefore', 'consequently', 'furthermore', 'moreover', 'accordingly', 'hence', 'thus', 'whereby', 'notwithstanding', 'aforementioned'];
    const casualWords = ['really', 'very', 'just', 'like', 'stuff', 'things', 'pretty', 'kinda', 'gonna', 'wanna', 'hey', 'cool', 'awesome'];

    const positiveCount = words.filter(w => positiveWords.some(pw => w.includes(pw))).length;
    const negativeCount = words.filter(w => negativeWords.some(nw => w.includes(nw))).length;
    const formalCount = words.filter(w => formalWords.some(fw => w.includes(fw))).length;
    const casualCount = words.filter(w => casualWords.some(cw => w.includes(cw))).length;

    const sentimentScore = wordCount > 0 ? ((positiveCount - negativeCount) / wordCount) : 0;
    const toneScore = wordCount > 0 ? ((formalCount - casualCount) / wordCount) : 0;

    let sentimentLabel, toneLabel, clarityScore;
    if (sentimentScore > 0.05) sentimentLabel = 'Positive';
    else if (sentimentScore < -0.05) sentimentLabel = 'Negative';
    else sentimentLabel = 'Neutral';

    if (toneScore > 0.02) toneLabel = 'Formal';
    else if (toneScore < -0.02) toneLabel = 'Casual';
    else toneLabel = 'Professional';

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    clarityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgSentenceLength - 20) * 2));

    const wordsOver10Chars = words.filter(w => w.length > 10).length;
    const complexWordRatio = wordCount > 0 ? wordsOver10Chars / wordCount : 0;

    return NextResponse.json({
      success: true,
      data: {
        sentimentScore: parseFloat(sentimentScore.toFixed(3)),
        sentimentLabel,
        toneLabel,
        toneScore: parseFloat(toneScore.toFixed(3)),
        clarityScore: parseFloat(clarityScore.toFixed(1)),
        wordCount,
        sentenceCount: sentences.length,
        avgSentenceLength: parseFloat(avgSentenceLength.toFixed(1)),
        complexWordRatio: parseFloat(complexWordRatio.toFixed(3)),
        readability: avgSentenceLength < 25 ? 'Good' : 'Needs Improvement',
        suggestions: [
          sentimentScore < 0 ? 'Consider using more positive language to convey enthusiasm.' : null,
          toneLabel === 'Casual' ? 'For formal contexts, replace casual words with professional alternatives.' : null,
          avgSentenceLength > 25 ? 'Break long sentences into shorter, clearer ones.' : null,
          wordCount < 50 ? 'Text may be too brief for meaningful analysis.' : null,
        ].filter(Boolean)
      },
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
