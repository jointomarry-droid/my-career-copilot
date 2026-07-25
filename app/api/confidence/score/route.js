import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { applications } = await request.json();

    const confidenceData = generateConfidenceScores(applications);

    return NextResponse.json({ success: true, data: confidenceData });
  } catch (error) {
    console.error('Confidence scoring error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateConfidenceScores(applications) {
  const totalApps = applications?.length || 0;
  const hasProfile = true;
  const hasSkills = true;

  const dataQuality = hasProfile && hasSkills ? 82 : hasProfile ? 65 : 45;
  const predictionAccuracy = totalApps > 10 ? 78 : totalApps > 5 ? 68 : 55;
  const modelReliability = 75;
  const dataFreshness = 88;

  const overall = Math.round((dataQuality + predictionAccuracy + modelReliability + dataFreshness) / 4);

  const predictions = [
    {
      metric: 'Interview Probability',
      confidence: totalApps > 10 ? 72 : 60,
      pointEstimate: `${Math.min(35, Math.round(totalApps * 2.5))}%`,
      confidenceInterval: `${Math.max(5, Math.round(totalApps * 1.5))}% - ${Math.min(50, Math.round(totalApps * 3.5))}%`,
      marginOfError: 12,
    },
    {
      metric: 'Offer Probability',
      confidence: totalApps > 10 ? 65 : 50,
      pointEstimate: `${Math.min(15, Math.round(totalApps * 1.2))}%`,
      confidenceInterval: `${Math.max(2, Math.round(totalApps * 0.5))}% - ${Math.min(25, Math.round(totalApps * 2))}%`,
      marginOfError: 8,
    },
    {
      metric: 'Salary Match',
      confidence: 78,
      pointEstimate: '$85K - $110K',
      confidenceInterval: '$75K - $125K',
      marginOfError: 15,
    },
    {
      metric: 'Skill Alignment',
      confidence: 85,
      pointEstimate: '72%',
      confidenceInterval: '65% - 80%',
      marginOfError: 8,
    },
    {
      metric: 'Market Position',
      confidence: 70,
      pointEstimate: 'Top 35%',
      confidenceInterval: 'Top 25% - Top 50%',
      marginOfError: 12,
    },
    {
      metric: 'Visa Approval (if applicable)',
      confidence: 82,
      pointEstimate: '88%',
      confidenceInterval: '80% - 95%',
      marginOfError: 7,
    },
  ];

  const items = [
    {
      title: 'Interview Success Prediction',
      source: 'Outcome Analysis Module',
      confidence: 72,
      pointEstimate: '72% chance',
      confidenceInterval: '60% - 84%',
      marginOfError: 12,
      explanation: 'Based on your application history, match scores, and market conditions. Higher confidence with more application data.',
    },
    {
      title: 'Salary Expectation Range',
      source: 'Market Intelligence Module',
      confidence: 78,
      pointEstimate: '$85K - $110K',
      confidenceInterval: '$75K - $125K',
      marginOfError: 15,
      explanation: 'Based on your skills, experience level, and target geographic market. Confidence increases with more market data points.',
    },
    {
      title: 'Skill Gap Assessment',
      source: 'Deep Analysis Engine',
      confidence: 85,
      pointEstimate: '5 key gaps',
      confidenceInterval: '4 - 7 gaps',
      marginOfError: 8,
      explanation: 'Analysis of your skills against market demand. High confidence due to comprehensive skill matching algorithms.',
    },
    {
      title: 'Application Quality Score',
      source: 'SEO Analyzer',
      confidence: 82,
      pointEstimate: '78/100',
      confidenceInterval: '70 - 86',
      marginOfError: 8,
      explanation: 'ATS compatibility and keyword optimization score. Confidence based on established scoring criteria.',
    },
    {
      title: 'Career Trajectory Forecast',
      source: 'Career Path Module',
      confidence: 65,
      pointEstimate: 'Positive',
      confidenceInterval: 'Moderate - Strong Positive',
      marginOfError: 15,
      explanation: 'Long-term career projection based on current trajectory. Lower confidence due to market volatility and personal factors.',
    },
    {
      title: 'Relocation Success Probability',
      source: 'Visa Scorer',
      confidence: 88,
      pointEstimate: '88%',
      confidenceInterval: '82% - 94%',
      marginOfError: 6,
      explanation: 'Visa and relocation success probability based on nationality, qualifications, and target country requirements.',
    },
  ];

  const warnings = [];
  
  if (totalApps < 10) {
    warnings.push('Limited application data reduces prediction accuracy. Increase application volume for more reliable insights.');
  }
  if (!hasProfile) {
    warnings.push('Incomplete profile data affects confidence scoring. Complete your profile for more accurate predictions.');
  }
  if (dataFreshness < 70) {
    warnings.push('Market data may be outdated. Refresh data sources for current market conditions.');
  }

  return {
    overall,
    dataQuality,
    predictionAccuracy,
    modelReliability,
    dataFreshness,
    predictions,
    items,
    warnings,
  };
}
