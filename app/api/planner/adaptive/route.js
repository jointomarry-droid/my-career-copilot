import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { applications, profile, action, goal, goalId, progress, scenario } = await request.json();

    let result;
    switch (action) {
      case 'load':
        result = generatePlan(applications, profile);
        break;
      case 'addGoal':
        result = addGoalToPlan(applications, profile, goal);
        break;
      case 'updateProgress':
        result = updateGoalProgress(applications, profile, goalId, progress);
        break;
      case 'scenario':
        result = runScenario(applications, profile, scenario);
        break;
      default:
        result = generatePlan(applications, profile);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Planner error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generatePlan(applications, profile) {
  const goals = [
    {
      _id: 'goal-1',
      title: 'Master System Design',
      category: 'skill',
      priority: 'high',
      progress: 35,
      deadline: '2026-10-15',
      milestones: [
        { title: 'Complete Designing Data-Intensive Applications', requiredProgress: 25 },
        { title: 'Practice 10 system design problems', requiredProgress: 50 },
        { title: 'Build 2 mock system designs', requiredProgress: 75 },
        { title: 'Pass mock system design interview', requiredProgress: 100 },
      ],
    },
    {
      _id: 'goal-2',
      title: 'Apply to 5 Target Companies',
      category: 'application',
      priority: 'critical',
      progress: 60,
      deadline: '2026-08-30',
      milestones: [
        { title: 'Research company culture and requirements', requiredProgress: 20 },
        { title: 'Tailor resume for each company', requiredProgress: 40 },
        { title: 'Write personalized cover letters', requiredProgress: 60 },
        { title: 'Submit all applications', requiredProgress: 80 },
        { title: 'Follow up on applications', requiredProgress: 100 },
      ],
    },
    {
      _id: 'goal-3',
      title: 'AWS Cloud Practitioner Certification',
      category: 'skill',
      priority: 'medium',
      progress: 20,
      deadline: '2026-12-01',
      milestones: [
        { title: 'Complete AWS Cloud Practitioner course', requiredProgress: 30 },
        { title: 'Take 5 practice exams', requiredProgress: 60 },
        { title: 'Score 80%+ on practice tests', requiredProgress: 80 },
        { title: 'Pass certification exam', requiredProgress: 100 },
      ],
    },
    {
      _id: 'goal-4',
      title: 'Build Professional Network',
      category: 'networking',
      priority: 'medium',
      progress: 45,
      deadline: '2026-09-30',
      milestones: [
        { title: 'Connect with 10 industry professionals', requiredProgress: 25 },
        { title: 'Attend 2 virtual networking events', requiredProgress: 50 },
        { title: 'Schedule 3 informational interviews', requiredProgress: 75 },
        { title: 'Get 2 referrals', requiredProgress: 100 },
      ],
    },
    {
      _id: 'goal-5',
      title: 'Complete 50 Coding Challenges',
      category: 'interview',
      priority: 'high',
      progress: 40,
      deadline: '2026-09-15',
      milestones: [
        { title: 'Solve 15 easy problems', requiredProgress: 30 },
        { title: 'Solve 20 medium problems', requiredProgress: 60 },
        { title: 'Solve 10 hard problems', requiredProgress: 80 },
        { title: 'Complete 5 mock interviews', requiredProgress: 100 },
      ],
    },
  ];

  const timeline = [
    { title: 'Current Role - Skill Building', date: 'Now', description: 'Focus on system design and cloud skills while applying to target companies', status: 'current', impact: 'Foundation' },
    { title: 'Interview Phase', date: 'Aug-Sep 2026', description: 'Active interview preparation and application follow-ups', status: 'upcoming', impact: 'Career Advancement' },
    { title: 'Certification Achievement', date: 'Oct-Dec 2026', description: 'Complete AWS certification and advanced skill development', status: 'upcoming', impact: 'Credential' },
    { title: 'Senior Role Target', date: 'Q1 2027', description: 'Target senior engineer or tech lead positions', status: 'future', impact: 'Level Up' },
  ];

  return { goals, timeline };
}

function addGoalToPlan(applications, profile, goal) {
  const existingPlan = generatePlan(applications, profile);
  const newGoal = {
    _id: `goal-${Date.now()}`,
    title: goal.title,
    category: goal.category,
    priority: goal.priority,
    progress: 0,
    deadline: goal.deadline,
    milestones: generateMilestones(goal),
  };
  
  return {
    ...existingPlan,
    goals: [...existingPlan.goals, newGoal],
  };
}

function generateMilestones(goal) {
  const milestonesByCategory = {
    skill: [
      { title: 'Start learning resource', requiredProgress: 20 },
      { title: 'Complete basics', requiredProgress: 40 },
      { title: 'Build practice project', requiredProgress: 70 },
      { title: 'Demonstrate proficiency', requiredProgress: 100 },
    ],
    application: [
      { title: 'Research target', requiredProgress: 25 },
      { title: 'Prepare materials', requiredProgress: 50 },
      { title: 'Submit application', requiredProgress: 75 },
      { title: 'Follow up', requiredProgress: 100 },
    ],
    networking: [
      { title: 'Identify contacts', requiredProgress: 25 },
      { title: 'Make initial contact', requiredProgress: 50 },
      { title: 'Build relationship', requiredProgress: 75 },
      { title: 'Secure referral', requiredProgress: 100 },
    ],
    interview: [
      { title: 'Study format', requiredProgress: 25 },
      { title: 'Practice questions', requiredProgress: 50 },
      { title: 'Mock interviews', requiredProgress: 75 },
      { title: 'Real interview', requiredProgress: 100 },
    ],
    relocation: [
      { title: 'Research market', requiredProgress: 20 },
      { title: 'Prepare documents', requiredProgress: 40 },
      { title: 'Apply for positions', requiredProgress: 60 },
      { title: 'Secure offer', requiredProgress: 80 },
      { title: 'Complete relocation', requiredProgress: 100 },
    ],
  };

  return milestonesByCategory[goal.category] || milestonesByCategory.skill;
}

function updateGoalProgress(applications, profile, goalId, progress) {
  const plan = generatePlan(applications, profile);
  plan.goals = plan.goals.map(g => 
    g._id === goalId ? { ...g, progress: Math.min(100, progress) } : g
  );
  return plan;
}

function runScenario(applications, profile, scenario) {
  const scenarios = {
    'learn-ai': {
      title: 'Learn AI/ML Integration',
      salaryImpact: 25,
      jobImpact: 40,
      timeRequired: '3-6 months',
      analysis: 'Adding AI/ML skills to your profile would open up 40% more job opportunities and command a 25% salary premium. The learning curve is moderate with many accessible resources available.',
    },
    'relocate': {
      title: 'Relocate to European Tech Hub',
      salaryImpact: 40,
      jobImpact: 30,
      timeRequired: '2-4 months',
      analysis: 'Relocating to Germany, Netherlands, or UK could increase your salary by 40% while offering excellent work-life balance. The EU Blue Card pathway makes this feasible for skilled developers.',
    },
    'startup': {
      title: 'Join a High-Growth Startup',
      salaryImpact: 15,
      jobImpact: 25,
      timeRequired: '1-2 months',
      analysis: 'Joining a Series A-C startup could provide 15% higher base salary plus significant equity upside. The risk is higher but so is the potential for rapid career growth and leadership opportunities.',
    },
  };

  return scenarios[scenario?.id] || scenarios['learn-ai'];
}
