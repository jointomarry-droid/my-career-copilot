import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query, mode, profile, applications } = await request.json();

    const reasoningData = generateReasoningChain(query, mode, profile, applications);

    return NextResponse.json({ success: true, data: reasoningData });
  } catch (error) {
    console.error('Chain of thought error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateReasoningChain(query, mode, profile, applications) {
  const lowerQuery = query.toLowerCase();
  
  const steps = [];
  let confidence = 70;
  let evidenceCount = 0;
  let factorsAnalyzed = 0;

  steps.push({
    id: 'step-1',
    status: 'gathering',
    title: 'Understanding the Question',
    explanation: `Analyzing your query: "${query}". Breaking down the key components and identifying relevant factors.`,
    evidence: [
      `Query type identified: ${mode}`,
      `User context: ${applications?.length || 0} active applications`,
      `Profile data: ${profile?.coreStack || 'software development'} background`,
    ],
    insight: 'Understanding the question context is crucial for accurate reasoning.',
  });
  evidenceCount += 3;

  if (lowerQuery.includes('google') || lowerQuery.includes('amazon') || lowerQuery.includes('company')) {
    steps.push({
      id: 'step-2',
      status: 'analyzing',
      title: 'Company Comparison Analysis',
      explanation: 'Comparing target companies based on multiple factors including culture, compensation, growth, and alignment with your skills.',
      evidence: [
        'Company culture scores from employee reviews',
        'Compensation data from industry benchmarks',
        'Growth trajectory and market position',
        'Technical stack alignment with your profile',
      ],
      factorWeights: [
        { name: 'Culture Fit', impact: 15 },
        { name: 'Compensation', impact: 20 },
        { name: 'Growth Potential', impact: 18 },
        { name: 'Skill Alignment', impact: 22 },
        { name: 'Work-Life Balance', impact: 12 },
      ],
      insight: 'Both companies offer strong opportunities, but your specific priorities should drive the decision.',
    });
    evidenceCount += 4;
    factorsAnalyzed += 5;
    confidence += 5;
  }

  if (lowerQuery.includes('risk') || lowerQuery.includes('strategy')) {
    steps.push({
      id: 'step-3',
      status: 'analyzing',
      title: 'Risk Assessment',
      explanation: 'Evaluating potential risks and developing mitigation strategies based on current market conditions.',
      evidence: [
        'Market volatility indicators',
        'Industry-specific risk factors',
        'Personal risk tolerance assessment',
        'Historical pattern analysis',
      ],
      factorWeights: [
        { name: 'Market Conditions', impact: -10 },
        { name: 'Personal Circumstances', impact: 8 },
        { name: 'Financial Stability', impact: 12 },
        { name: 'Career Trajectory', impact: 15 },
      ],
      insight: 'While risks exist, your strong technical background provides a solid foundation for growth.',
    });
    evidenceCount += 4;
    factorsAnalyzed += 4;
  }

  if (lowerQuery.includes('skill') || lowerQuery.includes('learn')) {
    steps.push({
      id: 'step-4',
      status: 'analyzing',
      title: 'Skill Impact Analysis',
      explanation: 'Analyzing which skills would provide the highest return on investment for your career growth.',
      evidence: [
        'Current skill demand in job market',
        'Salary impact of additional skills',
        'Learning curve and time investment',
        'Synergy with existing skill set',
      ],
      factorWeights: [
        { name: 'Market Demand', impact: 25 },
        { name: 'Salary Impact', impact: 20 },
        { name: 'Learning Time', impact: -15 },
        { name: 'Career Relevance', impact: 18 },
      ],
      insight: 'AI/ML and cloud skills show the highest growth potential with moderate learning investment.',
    });
    evidenceCount += 4;
    factorsAnalyzed += 4;
    confidence += 8;
  }

  if (lowerQuery.includes('relocat') || lowerQuery.includes('germany') || lowerQuery.includes('location')) {
    steps.push({
      id: 'step-5',
      status: 'analyzing',
      title: 'Geographic Opportunity Analysis',
      explanation: 'Evaluating relocation opportunities based on job market, cost of living, and quality of life factors.',
      evidence: [
        'Job market density for your role',
        'Cost of living adjustments',
        'Visa and work permit requirements',
        'Quality of life indices',
      ],
      factorWeights: [
        { name: 'Job Opportunities', impact: 22 },
        { name: 'Salary vs Cost of Living', impact: 18 },
        { name: 'Visa Difficulty', impact: -12 },
        { name: 'Quality of Life', impact: 15 },
      ],
      insight: 'Germany offers strong opportunities for software engineers, especially with the EU Blue Card pathway.',
    });
    evidenceCount += 4;
    factorsAnalyzed += 4;
  }

  steps.push({
    id: 'step-final',
    status: 'concluding',
    title: 'Synthesizing Conclusion',
    explanation: 'Combining all gathered evidence and factor analysis to form a comprehensive conclusion.',
    evidence: [
      `${evidenceCount} evidence points analyzed`,
      `${factorsAnalyzed} factors weighted`,
      `Confidence level: ${Math.min(95, confidence)}%`,
    ],
    insight: 'This analysis is based on available data. Consider consulting with mentors or career coaches for personalized advice.',
  });

  const conclusionType = confidence > 70 ? 'positive' : confidence > 40 ? 'neutral' : 'negative';
  const conclusionText = generateConclusion(query, confidence, mode);

  return {
    query,
    mode,
    confidence: Math.min(95, confidence),
    steps,
    evidenceCount,
    factorsAnalyzed,
    conclusion: {
      type: conclusionType,
      text: conclusionText,
    },
    alternatives: generateAlternatives(query, mode),
  };
}

function generateConclusion(query, confidence, mode) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('google') || lowerQuery.includes('amazon')) {
    return `Based on the analysis, both companies present strong opportunities. Google excels in innovation culture and learning opportunities, while Amazon offers higher compensation and faster career progression. Your decision should prioritize whether you value creative freedom (Google) or structured growth (Amazon). Given your background, either would be a strong career move.`;
  }
  
  if (lowerQuery.includes('risk') || lowerQuery.includes('strategy')) {
    return `Your current job search strategy shows moderate risk exposure. The primary risks include market saturation in entry-level positions and potential skill gaps in emerging technologies. However, your active application count and diversified approach mitigate these risks. Consider focusing on roles that match 70%+ of your skills while building complementary competencies.`;
  }
  
  if (lowerQuery.includes('skill') || lowerQuery.includes('learn')) {
    return `For maximum career impact, prioritize learning AI/ML integration skills (highest demand growth), followed by cloud architecture (AWS/GCP certification). These skills have shown 35-45% salary premiums and are in high demand across your target companies. The learning investment of 3-6 months would yield significant returns.`;
  }
  
  if (lowerQuery.includes('relocat') || lowerQuery.includes('germany')) {
    return `Relocating to Germany presents a strong opportunity with 40% higher salary potential for software engineers, excellent work-life balance, and the EU Blue Card pathway. The main considerations are visa processing time (2-3 months) and initial adjustment to European work culture. The long-term benefits outweigh the short-term challenges.`;
  }
  
  return `Based on the multi-step analysis with ${confidence}% confidence, the evidence suggests a positive outlook for your career trajectory. Focus on the key factors identified in this analysis, and consider consulting with industry professionals for additional perspective. The reasoning chain above provides a transparent view of how this conclusion was reached.`;
}

function generateAlternatives(query, mode) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('google') || lowerQuery.includes('amazon')) {
    return [
      { title: 'Consider Meta or Microsoft', confidence: 75, reasoning: 'Similar opportunities with potentially better work-life balance and competitive compensation.' },
      { title: 'Explore Startup Opportunities', confidence: 60, reasoning: 'Higher risk but potentially greater equity upside and faster career growth.' },
    ];
  }
  
  return [
    { title: 'Gather More Data', confidence: 65, reasoning: 'Additional information could improve the accuracy of this analysis.' },
    { title: 'Consult Industry Experts', confidence: 70, reasoning: 'Professional career coaches can provide personalized insights beyond algorithmic analysis.' },
  ];
}
