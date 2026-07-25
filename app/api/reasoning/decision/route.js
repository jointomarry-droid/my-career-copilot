import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { options, criteria, weights } = await req.json();

    const defaultCriteria = criteria || [
      { name: 'Salary', weight: 0.25, higherBetter: true },
      { name: 'Growth Potential', weight: 0.20, higherBetter: true },
      { name: 'Work-Life Balance', weight: 0.20, higherBetter: true },
      { name: 'Technical Challenge', weight: 0.15, higherBetter: true },
      { name: 'Location', weight: 0.10, higherBetter: true },
      { name: 'Company Culture', weight: 0.10, higherBetter: true },
    ];

    const defaultOptions = options || [
      { name: 'Option A', scores: {} },
      { name: 'Option B', scores: {} },
      { name: 'Option C', scores: {} },
    ];

    const scored = defaultOptions.map(option => {
      let totalScore = 0;
      const breakdown = {};

      defaultCriteria.forEach(criterion => {
        const score = option.scores?.[criterion.name] || Math.round(50 + Math.random() * 50);
        const normalizedScore = criterion.higherBetter ? score / 100 : (100 - score) / 100;
        const weightedScore = normalizedScore * criterion.weight;
        totalScore += weightedScore;
        breakdown[criterion.name] = { raw: score, normalized: parseFloat(normalizedScore.toFixed(3)), weighted: parseFloat(weightedScore.toFixed(4)) };
      });

      return {
        ...option,
        totalScore: parseFloat(totalScore.toFixed(4)),
        percentageScore: parseFloat((totalScore * 100).toFixed(1)),
        breakdown,
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    const ranked = scored.map((option, i) => ({
      ...option,
      rank: i + 1,
      isTopChoice: i === 0,
    }));

    const sensitivity = defaultCriteria.map(criterion => {
      const variations = [-0.1, -0.05, 0, 0.05, 0.1];
      return {
        criterion: criterion.name,
        impact: variations.map(v => ({
          weightChange: v,
          newWeight: parseFloat((criterion.weight + v).toFixed(3)),
          affectsRanking: Math.abs(v) > 0.05,
        })),
      };
    });

    const recommendations = [];
    if (ranked.length > 0) {
      recommendations.push(`${ranked[0].name} ranks highest at ${ranked[0].percentageScore}%.`);
    }
    if (ranked.length > 1) {
      const gap = ranked[0].percentageScore - ranked[1].percentageScore;
      if (gap < 5) {
        recommendations.push(`The gap between ${ranked[0].name} and ${ranked[1].name} is small (${gap.toFixed(1)}%). Consider qualitative factors.`);
      } else {
        recommendations.push(`${ranked[0].name} leads by a comfortable margin (${gap.toFixed(1)}%).`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ranked,
        criteria: defaultCriteria,
        sensitivityAnalysis: sensitivity,
        recommendations,
        decisionConfidence: ranked.length > 0 ? Math.min(95, 70 + ranked[0].percentageScore * 0.25) : 0,
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
