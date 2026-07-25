import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { applications } = await req.json();
    const apps = applications || [];

    const items = [];
    const now = new Date();

    if (apps.length > 0) {
      const responded = apps.filter(a => a.status === 'responded' || a.status === 'interviewing');
      const rejected = apps.filter(a => a.status === 'rejected');
      const successRate = apps.length > 0 ? ((responded.length / apps.length) * 100) : 0;

      if (successRate < 15 && apps.length >= 5) {
        items.push({
          type: 'success_rate',
          severity: 'critical',
          title: 'Low Response Rate Detected',
          description: `Your response rate is ${successRate.toFixed(1)}%, significantly below the 20-30% benchmark.`,
          recommendation: 'Review your resume tailoring approach, cover letter personalization, and targeting strategy.',
          impact: Math.round(-15 - Math.random() * 10),
          timestamp: now.toISOString()
        });
      }

      if (rejected.length > apps.length * 0.5 && apps.length >= 5) {
        items.push({
          type: 'rejection_pattern',
          severity: 'warning',
          title: 'High Rejection Pattern',
          description: `${rejected.length} of ${apps.length} applications were rejected (${((rejected.length / apps.length) * 100).toFixed(0)}%).`,
          recommendation: 'Analyze rejection reasons. Consider adjusting target role level, company size, or industry focus.',
          impact: Math.round(-10 - Math.random() * 5),
          timestamp: now.toISOString()
        });
      }

      const urgentDeadlines = apps.filter(a => {
        if (!a.deadline) return false;
        const daysUntil = (new Date(a.deadline) - now) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil < 3;
      });
      if (urgentDeadlines.length > 0) {
        items.push({
          type: 'deadline_conflict',
          severity: 'warning',
          title: `${urgentDeadlines.length} Application(s) Due Within 3 Days`,
          description: `You have applications with approaching deadlines: ${urgentDeadlines.map(a => a.company || 'Unknown').join(', ')}.`,
          recommendation: 'Prioritize these applications or adjust your timeline to avoid missed opportunities.',
          impact: 0,
          timestamp: now.toISOString()
        });
      }

      if (responded.length >= 3) {
        items.push({
          type: 'positive',
          severity: 'positive',
          title: 'Strong Engagement Momentum',
          description: `${responded.length} applications have received responses—your pipeline is active.`,
          recommendation: 'Maintain follow-up cadence and continue building on this momentum.',
          impact: Math.round(5 + Math.random() * 5),
          timestamp: now.toISOString()
        });
      }

      const oldApps = apps.filter(a => {
        if (!a.appliedDate) return false;
        const daysSince = (now - new Date(a.appliedDate)) / (1000 * 60 * 60 * 24);
        return daysSince > 21 && a.status === 'applied';
      });
      if (oldApps.length > 0) {
        items.push({
          type: 'response_time',
          severity: 'info',
          title: `${oldApps.length} Application(s) Pending >3 Weeks`,
          description: `${oldApps.length} applications have not received a response after 3+ weeks.`,
          recommendation: 'Send polite follow-up emails to re-engage hiring managers.',
          impact: Math.round(3 + Math.random() * 4),
          timestamp: now.toISOString()
        });
      }

      const companies = apps.map(a => a.company).filter(Boolean);
      const uniqueCompanies = [...new Set(companies)];
      if (uniqueCompanies.length < apps.length * 0.8 && apps.length >= 4) {
        items.push({
          type: 'market_shift',
          severity: 'info',
          title: 'Limited Company Diversification',
          description: `You're applying to ${uniqueCompanies.length} unique companies across ${apps.length} applications.`,
          recommendation: 'Diversify your target company list to reduce risk and increase opportunities.',
          impact: 0,
          timestamp: now.toISOString()
        });
      }
    }

    if (items.length === 0) {
      items.push({
        type: 'positive',
        severity: 'positive',
        title: 'Application Health Looks Good',
        description: 'No significant anomalies detected in your application patterns.',
        recommendation: 'Keep up the consistent effort and monitor trends over time.',
        impact: 5,
        timestamp: now.toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        criticalCount: items.filter(i => i.severity === 'critical').length,
        warningCount: items.filter(i => i.severity === 'warning').length,
        infoCount: items.filter(i => i.severity === 'info').length,
        positiveCount: items.filter(i => i.severity === 'positive').length,
        summary: `Scanned ${apps.length} applications. Found ${items.length} anomaly/anomalies. ${items.filter(i => i.severity === 'critical' || i.severity === 'warning').length} require attention.`
      },
      scannedAt: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
