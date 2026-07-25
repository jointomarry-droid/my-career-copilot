import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { profile } = await req.json();
    const workHistory = profile?.workHistory || [];
    const skills = profile?.skills || [];
    const targetRole = profile?.targetRole || 'Software Engineer';

    const yearsExp = workHistory.reduce((acc, w) => acc + (w.duration ? parseInt(w.duration) || 1 : 1), 0);

    const trajectoryPoints = [];
    const now = new Date();

    for (let i = -3; i <= 5; i++) {
      const year = now.getFullYear() + i;
      const baseLevel = Math.min(10, 3 + yearsExp + i);
      trajectoryPoints.push({
        year,
        label: `${year}`,
        level: parseFloat(Math.max(1, Math.min(10, baseLevel + (Math.random() - 0.5) * 2)).toFixed(1)),
        confidence: i <= 0 ? 0.9 : Math.max(0.3, 0.9 - i * 0.1),
        type: i <= 0 ? 'historical' : 'projected',
      });
    }

    const milestones = [
      { year: now.getFullYear() - 2, label: 'Career Foundation', type: 'historical' },
      { year: now.getFullYear(), label: 'Current Position', type: 'current' },
      { year: now.getFullYear() + 2, label: 'Senior Role Target', type: 'projected' },
      { year: now.getFullYear() + 4, label: 'Leadership Track', type: 'projected' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        trajectoryPoints,
        milestones,
        currentLevel: yearsExp + 3,
        projectedLevel5yr: Math.min(10, yearsExp + 8),
        targetRole,
        yearsExperience: yearsExp,
        insights: [
          `Based on ${yearsExp} years of experience, you're on track for senior-level roles.`,
          `Your skill set in ${skills.slice(0, 3).join(', ') || 'core areas'} positions you well for growth.`,
          `Projected trajectory shows steady advancement over the next 5 years.`,
        ],
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
