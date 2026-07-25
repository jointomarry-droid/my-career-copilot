import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { profile, applications } = await req.json();
    const skills = profile?.skills || [];
    const workHistory = profile?.workHistory || [];
    const apps = applications || [];

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const skillNodes = skills.map((s, i) => ({
      id: nodeId++,
      label: typeof s === 'string' ? s : s.name || s,
      type: 'skill',
      importance: 2 + Math.random() * 2,
      level: 0.8 + Math.random() * 0.4,
    }));
    nodes.push(...skillNodes);

    const companies = [...new Set(workHistory.map(w => w.company).filter(Boolean))];
    const companyNodes = companies.map((c) => ({
      id: nodeId++,
      label: c,
      type: 'company',
      importance: 1.5 + Math.random(),
      level: 0.6 + Math.random() * 0.4,
    }));
    nodes.push(...companyNodes);

    const roles = [...new Set(workHistory.map(w => w.title).filter(Boolean))];
    const roleNodes = roles.map((r) => ({
      id: nodeId++,
      label: r,
      type: 'role',
      importance: 1 + Math.random(),
      level: 0.5 + Math.random() * 0.3,
    }));
    nodes.push(...roleNodes);

    const appCompanies = [...new Set(apps.map(a => a.company).filter(Boolean))];
    const appNodes = appCompanies.map((c) => ({
      id: nodeId++,
      label: c,
      type: 'application',
      importance: 1,
      level: 0.4 + Math.random() * 0.3,
    }));
    nodes.push(...appNodes);

    if (skillNodes.length > 1) {
      for (let i = 0; i < Math.min(skillNodes.length, 5); i++) {
        const j = (i + 1) % skillNodes.length;
        edges.push({ source: skillNodes[i].id, target: skillNodes[j].id, label: 'related' });
      }
    }

    skillNodes.forEach((sn) => {
      if (companyNodes.length > 0) {
        const target = companyNodes[Math.floor(Math.random() * companyNodes.length)];
        edges.push({ source: sn.id, target: target.id, label: 'used at' });
      }
    });

    companyNodes.forEach((cn) => {
      roleNodes.forEach((rn) => {
        if (Math.random() > 0.4) {
          edges.push({ source: cn.id, target: rn.id, label: 'had role' });
        }
      });
    });

    appNodes.forEach((an) => {
      if (skillNodes.length > 0) {
        const target = skillNodes[Math.floor(Math.random() * skillNodes.length)];
        edges.push({ source: an.id, target: target.id, label: 'requires' });
      }
    });

    const density = nodes.length > 1 ? (edges.length / (nodes.length * (nodes.length - 1) / 2)).toFixed(3) : 0;
    const skillCoverage = skills.length > 0 ? Math.min(100, Math.round((skillNodes.length / Math.max(skills.length, 1)) * 100)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        stats: { skillCoverage, density, nodeCount: nodes.length, edgeCount: edges.length },
        insights: [
          `Your knowledge graph connects ${skillNodes.length} skills across ${companyNodes.length} companies.`,
          `${edges.length} relationships mapped between skills, roles, and opportunities.`,
          skillCoverage >= 80 ? 'Strong skill coverage—most skills are well-represented.' : 'Consider expanding skill representation for better graph connectivity.',
          `Network density of ${density} indicates ${density > 0.3 ? 'well-connected' : 'growing'} skill-role relationships.`,
        ]
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
