import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { type, profile, applications, customAngle } = await req.json();

    const skills = profile?.skills || [];
    const workHistory = profile?.workHistory || [];
    const education = profile?.education || [];
    const targetRole = profile?.targetRole || 'Software Engineer';
    const yearsExp = workHistory.reduce((acc, w) => acc + (w.duration ? parseInt(w.duration) || 1 : 1), 0);

    const narratives = {
      growth: {
        text: buildGrowthNarrative(skills, workHistory, education, targetRole, yearsExp, customAngle),
        themes: ['Progressive Responsibility', 'Skill Accumulation', 'Continuous Learning', 'Career Advancement'],
        usageSuggestions: [
          'Use in cover letters to frame your career trajectory',
          'Adapt for "Tell me about yourself" interview responses',
          'Include in LinkedIn summary for employer visibility',
          'Reference during salary negotiations to demonstrate growth'
        ],
        variations: [
          { context: 'Interview (2 min)', text: `I'm a ${targetRole} with ${yearsExp} years of experience. My career has been defined by progressively taking on more complex challenges—from ${workHistory[0]?.title || 'my first role'} where I built foundational skills, to my current position where I ${skills.length > 0 ? `leverage expertise in ${skills.slice(0, 3).join(', ')}` : 'drive technical decisions'}. Each transition has expanded both my technical depth and my ability to deliver business impact.` },
          { context: 'LinkedIn Summary', text: `${targetRole} | ${yearsExp}+ years building scalable solutions | Passionate about ${skills.slice(0, 2).join(' & ') || 'innovation'}` },
          { context: 'Cover Letter Opener', text: `Throughout my ${yearsExp}-year career, I've consistently evolved from individual contributor to strategic problem-solver. My trajectory from ${workHistory[0]?.title || 'early roles'} to ${workHistory[workHistory.length - 1]?.title || targetRole} reflects a deliberate focus on ${skills.length > 0 ? skills[0] : 'technical excellence'} and cross-functional leadership.` }
        ]
      },
      pivot: {
        text: buildPivotNarrative(skills, workHistory, education, targetRole, customAngle),
        themes: ['Transferable Skills', 'Intentional Transition', 'Fresh Perspective', 'Hybrid Value'],
        usageSuggestions: [
          'Use when explaining career changes to recruiters',
          'Frame non-traditional background as an asset',
          'Reference in networking conversations about your transition',
          'Include in personal statement for grad school or bootcamps'
        ],
        variations: [
          { context: 'Interview (2 min)', text: `My background in ${workHistory[0]?.industry || 'my previous field'} gives me a unique perspective as a ${targetRole}. I bring ${skills.length > 0 ? skills.slice(0, 2).join(' and ') : 'analytical thinking'} from a different domain, combined with fresh technical training. This hybrid background lets me ${customAngle || 'approach problems from angles that pure technologists might miss'}.` },
          { context: 'Recruiter Pitch', text: `I transitioned from ${workHistory[0]?.industry || 'my previous career'} into tech because I saw how ${skills[0] || 'technology'} could transform ${workHistory[0]?.industry || 'industries'}. My domain expertise plus technical skills makes me uniquely qualified for roles at the intersection of business and engineering.` }
        ]
      },
      expertise: {
        text: buildExpertiseNarrative(skills, workHistory, targetRole, yearsExp, customAngle),
        themes: ['Technical Depth', 'Specialized Knowledge', 'Thought Leadership', 'Hands-on Mastery'],
        usageSuggestions: [
          'Lead with this narrative in technical interviews',
          'Use in conference talk proposals or blog posts',
          'Reference when positioning for senior/staff roles',
          'Include in portfolio or personal website About section'
        ],
        variations: [
          { context: 'Technical Interview', text: `I specialize in ${skills.slice(0, 3).join(', ') || 'core technologies in this space'}. Over ${yearsExp} years, I've ${workHistory.length > 0 ? `led ${workHistory[0]?.achievements?.[0] || 'complex projects'} at ${workHistory[0]?.company || 'various companies'}` : 'built and shipped production systems'}. My depth in ${skills[0] || 'this area'} comes from solving real-scale problems, not just theoretical knowledge.` }
        ]
      },
      impact: {
        text: buildImpactNarrative(skills, workHistory, targetRole, yearsExp, customAngle),
        themes: ['Quantifiable Results', 'Business Value Delivery', 'Measurable Outcomes', 'ROI Focus'],
        usageSuggestions: [
          'Use in resume bullet points to add narrative context',
          'Reference in performance reviews and promotion discussions',
          'Lead with impact metrics in executive-level conversations',
          'Include in case studies or portfolio project descriptions'
        ],
        variations: [
          { context: 'Executive Summary', text: `${yearsExp}-year track record of delivering measurable business impact as a ${targetRole}. Consistently translate technical capabilities into revenue growth, cost reduction, or operational efficiency. Key focus areas: ${skills.slice(0, 2).join(' and ') || 'scalable architecture and team leadership'}.` }
        ]
      }
    };

    const result = narratives[type] || narratives.growth;

    return NextResponse.json({
      success: true,
      data: result,
      generatedAt: new Date().toISOString(),
      meta: { type, targetRole, yearsExp }
    });
  } catch (error) {
    console.error('Narrative generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function buildGrowthNarrative(skills, workHistory, education, targetRole, yearsExp, customAngle) {
  let narrative = `My career journey to becoming a ${targetRole} has been shaped by ${yearsExp} years of progressive growth.`;
  if (workHistory.length > 0) {
    narrative += ` Starting as a ${workHistory[0].title || 'junior professional'} at ${workHistory[0].company || 'my first company'}, I developed foundational expertise`;
    if (skills.length > 0) narrative += ` in ${skills.slice(0, 3).join(', ')}`;
    narrative += '. ';
  }
  if (workHistory.length > 1) {
    const latest = workHistory[workHistory.length - 1];
    narrative += `Each role since has expanded my capabilities—most recently as ${latest.title || 'a senior professional'} at ${latest.company || 'my current company'}, where I've driven meaningful impact. `;
  }
  if (education.length > 0) {
    narrative += `My ${education[0].degree || 'education'} in ${education[0].field || 'a relevant field'} from ${education[0].institution || 'my university'} provided the theoretical foundation that I've continuously built upon. `;
  }
  if (customAngle) narrative += customAngle + ' ';
  narrative += `Today, I'm focused on ${targetRole} opportunities where I can leverage this accumulated experience to drive outsized results.`;
  return narrative;
}

function buildPivotNarrative(skills, workHistory, targetRole, customAngle) {
  let narrative = `My transition into ${targetRole} is rooted in a conviction born from ${workHistory[0]?.industry || 'my previous experience'}. `;
  if (workHistory.length > 0) {
    narrative += `Having spent time as a ${workHistory[0].title || 'professional'} in ${workHistory[0].industry || 'a related field'}, I witnessed firsthand how ${skills[0] || 'technology'} transforms outcomes. `;
  }
  narrative += `Rather than watching from the sidelines, I invested in building technical capabilities through ${skills.length > 0 ? `mastering ${skills.slice(0, 3).join(', ')}` : 'intensive self-study and project work'}. `;
  if (customAngle) narrative += customAngle + ' ';
  narrative += `This dual perspective—domain expertise plus technical skill—positions me to bridge gaps that pure technologists or pure domain experts often can't see.`;
  return narrative;
}

function buildExpertiseNarrative(skills, workHistory, targetRole, yearsExp, customAngle) {
  let narrative = `I've spent ${yearsExp} years developing deep expertise in ${skills.slice(0, 3).join(', ') || 'core technical competencies'}. `;
  if (workHistory.length > 0) {
    narrative += `This specialization was forged at ${workHistory.map(w => w.company).filter(Boolean).join(' and ')} where I tackled challenges that demanded mastery, not just competence. `;
  }
  if (customAngle) narrative += customAngle + ' ';
  narrative += `As a ${targetRole}, I bring the kind of depth that comes from years of production experience—not surface-level familiarity.`;
  return narrative;
}

function buildImpactNarrative(skills, workHistory, targetRole, yearsExp, customAngle) {
  let narrative = `Throughout my ${yearsExp}-year career as a ${targetRole}, I've prioritized measurable impact over mere activity. `;
  if (workHistory.length > 0) {
    const latest = workHistory[workHistory.length - 1];
    narrative += `At ${latest.company || 'my current role'}, I ${latest.achievements?.[0] || 'delivered results that directly contributed to business objectives'}. `;
  }
  if (skills.length > 0) {
    narrative += `My approach combines ${skills[0] || 'technical excellence'} with business acumen to ensure every solution I build moves the needle. `;
  }
  if (customAngle) narrative += customAngle + ' ';
  narrative += `I believe the best engineers are those who can quantify their impact and connect technical decisions to business outcomes.`;
  return narrative;
}
