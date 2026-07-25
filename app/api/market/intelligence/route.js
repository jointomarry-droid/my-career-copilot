import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { country, role } = await request.json();

    const marketData = generateMarketData(country, role);

    return NextResponse.json({ success: true, data: marketData });
  } catch (error) {
    console.error('Market intelligence error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateMarketData(country, role) {
  return {
    trends: generateTrendData(role),
    salary: generateSalaryData(role, country),
    companies: generateCompanyData(country),
    skills: generateSkillData(role),
    geography: generateGeographyData(country),
  };
}

function generateTrendData(role) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseDemand = 100;
  const timeline = months.map((month, i) => ({
    month,
    demand: Math.round(baseDemand + Math.sin(i * 0.5) * 20 + Math.random() * 15),
  }));

  return {
    timeline,
    stats: [
      { label: 'Job Openings', trend: 12 },
      { label: 'Avg Applications', trend: -5 },
      { label: 'Response Rate', trend: 8 },
      { label: 'Interview Rate', trend: 15 },
    ],
    hotSkills: [
      { name: 'AI/ML Integration', growth: 45 },
      { name: 'Cloud Architecture', growth: 32 },
      { name: 'DevOps', growth: 28 },
      { name: 'TypeScript', growth: 24 },
      { name: 'React/Next.js', growth: 20 },
      { name: 'Python', growth: 18 },
      { name: 'Kubernetes', growth: 15 },
      { name: 'GraphQL', growth: 12 },
    ],
  };
}

function generateSalaryData(role, country) {
  const salaryRanges = {
    'Software Engineer': {
      us: { min: 85000, median: 115000, max: 160000 },
      uk: { min: 45000, median: 65000, max: 95000 },
      de: { min: 55000, median: 75000, max: 110000 },
      nl: { min: 50000, median: 70000, max: 100000 },
      ca: { min: 70000, median: 95000, max: 135000 },
    },
    'Data Scientist': {
      us: { min: 95000, median: 130000, max: 180000 },
      uk: { min: 50000, median: 70000, max: 100000 },
      de: { min: 60000, median: 85000, max: 120000 },
      nl: { min: 55000, median: 75000, max: 110000 },
      ca: { min: 80000, median: 110000, max: 150000 },
    },
    'Product Manager': {
      us: { min: 100000, median: 135000, max: 185000 },
      uk: { min: 55000, median: 75000, max: 110000 },
      de: { min: 65000, median: 90000, max: 130000 },
      nl: { min: 60000, median: 80000, max: 115000 },
      ca: { min: 85000, median: 115000, max: 160000 },
    },
    'DevOps Engineer': {
      us: { min: 90000, median: 125000, max: 170000 },
      uk: { min: 48000, median: 68000, max: 98000 },
      de: { min: 58000, median: 80000, max: 115000 },
      nl: { min: 52000, median: 72000, max: 105000 },
      ca: { min: 75000, median: 100000, max: 140000 },
    },
    'ML Engineer': {
      us: { min: 110000, median: 150000, max: 200000 },
      uk: { min: 55000, median: 80000, max: 120000 },
      de: { min: 65000, median: 95000, max: 140000 },
      nl: { min: 60000, median: 85000, max: 125000 },
      ca: { min: 90000, median: 125000, max: 175000 },
    },
  };

  const roleData = salaryRanges[role] || salaryRanges['Software Engineer'];
  const countryData = roleData[country] || roleData['us'];

  return {
    byExperience: [
      { level: 'Junior', min: Math.round(countryData.min * 0.7), median: Math.round(countryData.min * 0.85), max: countryData.min },
      { level: 'Mid-Level', min: countryData.min, median: Math.round((countryData.min + countryData.median) / 2), max: countryData.median },
      { level: 'Senior', min: countryData.median, median: Math.round((countryData.median + countryData.max) / 2), max: countryData.max },
      { level: 'Lead/Principal', min: countryData.max, median: Math.round(countryData.max * 1.15), max: Math.round(countryData.max * 1.35) },
    ],
    yourRange: `$${Math.round(countryData.min / 1000)}K - $${Math.round(countryData.max / 1000)}K`,
    marketAverage: `$${Math.round(countryData.median / 1000)}K`,
    topTenPercent: `$${Math.round(countryData.max * 1.2 / 1000)}K+`,
    compBreakdown: [
      { name: 'Base Salary', value: 65 },
      { name: 'Bonus', value: 15 },
      { name: 'Equity', value: 12 },
      { name: 'Benefits', value: 8 },
    ],
  };
}

function generateCompanyData(country) {
  const companies = [
    { name: 'Google', industry: 'Technology', rating: 4.5, growth: 15, cultureScore: 88, workLifeBalance: 82, compensationScore: 95, perks: ['Free meals', 'Gym', '20% time'] },
    { name: 'Microsoft', industry: 'Technology', rating: 4.4, growth: 12, cultureScore: 85, workLifeBalance: 80, compensationScore: 92, perks: ['Remote work', 'Stock purchase', 'Education'] },
    { name: 'Amazon', industry: 'E-commerce/Cloud', rating: 4.0, growth: 18, cultureScore: 75, workLifeBalance: 70, compensationScore: 90, perks: ['Sign-on bonus', 'RSUs', 'Career choice'] },
    { name: 'Meta', industry: 'Social Media', rating: 4.2, growth: 10, cultureScore: 82, workLifeBalance: 78, compensationScore: 94, perks: ['Remote first', 'Wellness', 'Parental leave'] },
    { name: 'Apple', industry: 'Consumer Electronics', rating: 4.6, growth: 8, cultureScore: 90, workLifeBalance: 75, compensationScore: 93, perks: ['Employee purchase', 'Wellness', 'Stock grants'] },
    { name: 'Netflix', industry: 'Entertainment', rating: 4.3, growth: 20, cultureScore: 87, workLifeBalance: 85, compensationScore: 98, perks: ['Top of market pay', 'Unlimited PTO', 'Stock options'] },
  ];

  return companies;
}

function generateSkillData(role) {
  const skillsByRole = {
    'Software Engineer': {
      demand: [
        { skill: 'JavaScript/TypeScript', demand: 95 },
        { skill: 'React', demand: 88 },
        { skill: 'Node.js', demand: 82 },
        { skill: 'Python', demand: 80 },
        { skill: 'SQL', demand: 75 },
        { skill: 'AWS/Cloud', demand: 72 },
        { skill: 'Docker', demand: 68 },
        { skill: 'Git', demand: 90 },
      ],
      rising: [
        { name: 'AI/ML Integration', growth: 45 },
        { name: 'Rust', growth: 35 },
        { name: 'WebAssembly', growth: 28 },
      ],
      declining: [
        { name: 'jQuery', decline: -25 },
        { name: 'PHP (Legacy)', decline: -15 },
        { name: 'Perl', decline: -30 },
      ],
    },
    'Data Scientist': {
      demand: [
        { skill: 'Python', demand: 95 },
        { skill: 'SQL', demand: 88 },
        { skill: 'TensorFlow/PyTorch', demand: 85 },
        { skill: 'R', demand: 65 },
        { skill: 'Tableau', demand: 60 },
        { skill: 'Spark', demand: 55 },
      ],
      rising: [
        { name: 'LLM Fine-tuning', growth: 60 },
        { name: 'MLOps', growth: 42 },
        { name: 'Real-time ML', growth: 35 },
      ],
      declining: [
        { name: 'Hadoop', decline: -35 },
        { name: 'SAS', decline: -20 },
      ],
    },
  };

  const roleData = skillsByRole[role] || skillsByRole['Software Engineer'];
  return roleData;
}

function generateGeographyData(country) {
  return {
    distribution: [
      { region: 'North America', jobs: 45000 },
      { region: 'Europe', jobs: 32000 },
      { region: 'Asia Pacific', jobs: 28000 },
      { region: 'Remote Global', jobs: 18000 },
      { region: 'Latin America', jobs: 8000 },
    ],
    topCities: [
      { name: 'San Francisco', country: 'USA', openings: 8500, avgSalary: '$145K', demand: 92 },
      { name: 'New York', country: 'USA', openings: 7200, avgSalary: '$135K', demand: 88 },
      { name: 'London', country: 'UK', openings: 5800, avgSalary: '£75K', demand: 85 },
      { name: 'Berlin', country: 'Germany', openings: 4200, avgSalary: '€80K', demand: 82 },
      { name: 'Amsterdam', country: 'Netherlands', openings: 3500, avgSalary: '€75K', demand: 80 },
      { name: 'Toronto', country: 'Canada', openings: 3800, avgSalary: 'C$105K', demand: 78 },
    ],
  };
}
