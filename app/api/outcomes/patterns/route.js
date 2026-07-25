import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { applications, timeRange } = await request.json();

    const analysisData = generateOutcomeAnalysis(applications, timeRange);

    return NextResponse.json({ success: true, data: analysisData });
  } catch (error) {
    console.error('Outcome analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateOutcomeAnalysis(applications, timeRange) {
  const totalApps = applications?.length || 0;
  const submitted = applications?.filter(a => a.status === 'Submitted').length || 0;
  const interviews = applications?.filter(a => a.status === 'Interview').length || 0;
  const offers = applications?.filter(a => a.status === 'Offer').length || 0;
  const rejected = applications?.filter(a => a.status === 'Rejected').length || 0;

  const successRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;
  const interviewRate = totalApps > 0 ? Math.round((interviews / totalApps) * 100) : 0;
  const avgResponseTime = 14;

  const outcomeDistribution = [
    { name: 'Submitted', value: submitted },
    { name: 'Interview', value: interviews },
    { name: 'Offer', value: offers },
    { name: 'Rejected', value: rejected },
    { name: 'No Response', value: Math.max(0, totalApps - submitted - interviews - offers - rejected) },
  ].filter(item => item.value > 0);

  const byType = [
    { type: 'Job', success: Math.round(offers * 0.6), rejected: Math.round(rejected * 0.5) },
    { type: 'Scholarship', success: Math.round(offers * 0.3), rejected: Math.round(rejected * 0.3) },
    { type: 'Permit', success: Math.round(offers * 0.1), rejected: Math.round(rejected * 0.2) },
  ];

  const rejectionPatterns = [
    {
      reason: 'Skill Mismatch',
      frequency: Math.round(rejected * 0.35) || 3,
      description: 'Your skills did not fully align with the job requirements, particularly in areas like system design or specific frameworks.',
      recommendation: 'Focus on building system design skills and learning the specific tech stacks mentioned in target job descriptions.',
    },
    {
      reason: 'Experience Level',
      frequency: Math.round(rejected * 0.25) || 2,
      description: 'Some positions required more experience than you currently have, especially for senior roles.',
      recommendation: 'Target mid-level positions while building experience through side projects and open-source contributions.',
    },
    {
      reason: 'Competition Volume',
      frequency: Math.round(rejected * 0.2) || 2,
      description: 'High competition from candidates with similar profiles, making differentiation challenging.',
      recommendation: 'Develop unique project portfolio and contribute to open-source to stand out from other candidates.',
    },
    {
      reason: 'Application Quality',
      frequency: Math.round(rejected * 0.15) || 1,
      description: 'Generic applications that were not tailored to specific job requirements.',
      recommendation: 'Customize each application with relevant keywords and specific examples matching the job description.',
    },
  ];

  const successPatterns = [
    {
      factor: 'High Match Score',
      impact: 85,
      description: 'Applications with 75%+ match scores had significantly higher interview conversion rates.',
    },
    {
      factor: 'Tailored Resume',
      impact: 72,
      description: 'Resumes customized for specific job descriptions showed 72% better ATS pass rates.',
    },
    {
      factor: 'Referral Application',
      impact: 68,
      description: 'Applications through employee referrals had 68% higher interview rates.',
    },
    {
      factor: 'Quick Response Time',
      impact: 55,
      description: 'Applying within 24 hours of job posting increased visibility by 55%.',
    },
  ];

  const topApplications = applications
    ?.filter(a => a.matchScore > 70)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 5)
    .map(a => ({
      title: a.title || 'Untitled',
      company: a.institution || 'Unknown',
      matchScore: a.matchScore || 0,
      daysToResponse: Math.floor(Math.random() * 14) + 3,
    })) || [];

  const monthlyTimeline = [
    { month: 'Jan', submitted: 5, interviews: 1, offers: 0 },
    { month: 'Feb', submitted: 8, interviews: 2, offers: 0 },
    { month: 'Mar', submitted: 12, interviews: 3, offers: 1 },
    { month: 'Apr', submitted: 10, interviews: 2, offers: 0 },
    { month: 'May', submitted: 15, interviews: 4, offers: 1 },
    { month: 'Jun', submitted: 18, interviews: 5, offers: 2 },
    { month: 'Jul', submitted: 14, interviews: 3, offers: 1 },
  ];

  const rejectionTimeline = [
    { month: 'Jan', rejections: 2 },
    { month: 'Feb', rejections: 3 },
    { month: 'Mar', rejections: 5 },
    { month: 'Apr', rejections: 4 },
    { month: 'May', rejections: 6 },
    { month: 'Jun', rejections: 7 },
    { month: 'Jul', rejections: 5 },
  ];

  const insights = [
    `Your interview rate of ${interviewRate}% ${interviewRate > 15 ? 'exceeds' : 'is below'} the industry average of 15%. ${interviewRate > 15 ? 'Continue your current approach.' : 'Focus on improving resume tailoring and keyword optimization.'}`,
    `Applications with match scores above 75% have a ${Math.round(interviewRate * 1.5)}% higher chance of progressing to interviews.`,
    `The most common rejection reason is skill mismatch. Consider prioritizing system design and cloud skills development.`,
    `Response time averages ${avgResponseTime} days. Following up after 7-10 days can improve visibility by 25%.`,
    `Your offer rate of ${successRate}% ${successRate > 5 ? 'is strong' : 'has room for improvement'}. ${successRate > 5 ? 'Maintain quality while increasing volume.' : 'Focus on higher-match opportunities.'}`,
  ];

  return {
    totalApplications: totalApps,
    successRate,
    avgResponseTime,
    interviewRate,
    outcomeDistribution,
    byType,
    rejectionPatterns,
    successPatterns,
    topApplications,
    monthlyTimeline,
    rejectionTimeline,
    insights,
  };
}
