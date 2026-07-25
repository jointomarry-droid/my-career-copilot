import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { type, profile, jobDescription, companyName, position, tone, focus } = await request.json();

    const contentData = generateContent(type, profile, { jobDescription, companyName, position, tone, focus });

    return NextResponse.json({ success: true, data: contentData });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateContent(type, profile, params) {
  switch (type) {
    case 'resume':
      return generateResumeTailor(profile, params);
    case 'coverletter':
      return generateCoverLetter(profile, params);
    case 'interview':
      return generateInterviewAnswers(profile, params);
    case 'email':
      return generateEmail(profile, params);
    default:
      return generateResumeTailor(profile, params);
  }
}

function generateResumeTailor(profile, params) {
  const { jobDescription, companyName, position, tone, focus } = params;
  const skills = profile?.coreStack || 'JavaScript, React, Node.js';
  
  const text = `PROFESSIONAL SUMMARY
Results-driven Software Developer with expertise in ${skills}. Seeking the ${position} position at ${companyName} to leverage strong technical skills and passion for building innovative solutions.

TECHNICAL SKILLS
• Frontend: React, Next.js, TypeScript, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Python, REST APIs, GraphQL
• Database: MongoDB, PostgreSQL, Redis
• Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
• Tools: Git, CI/CD, Jest, Webpack

EXPERIENCE

Senior Software Developer | Current Company | 2024 - Present
• Led development of microservices architecture serving 100K+ daily users
• Reduced API response time by 40% through optimization and caching strategies
• Mentored team of 5 junior developers, improving code quality metrics by 25%
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Developer | Previous Company | 2022 - 2024
• Built responsive web applications using React and TypeScript
• Designed and implemented RESTful APIs handling 1M+ requests daily
• Collaborated with product team to deliver 15+ features on schedule
• Improved test coverage from 45% to 85%, reducing production bugs by 30%

PROJECTS

E-Commerce Platform | Tech Stack: React, Node.js, MongoDB
• Built full-stack e-commerce solution with real-time inventory management
• Implemented payment processing with Stripe integration
• Achieved 99.9% uptime with automated monitoring and alerting

Task Management App | Tech Stack: Next.js, PostgreSQL, Redis
• Developed collaborative task management tool with real-time updates
• Implemented WebSocket-based notifications and live collaboration features
• Deployed on AWS with auto-scaling handling 10K+ concurrent users

EDUCATION
Bachelor of Science in Computer Science | University | 2022

CERTIFICATIONS
• AWS Certified Cloud Practitioner
• MongoDB Certified Developer
• React Professional Certificate

${focus === 'technical' ? `\nKEY ACHIEVEMENTS\n• System Design: Architected scalable microservices handling 10M+ daily transactions\n• Performance Optimization: Reduced application load time by 50% through code splitting and lazy loading\n• Security: Implemented OAuth 2.0 and JWT authentication, passing security audit with zero vulnerabilities` : ''}
${focus === 'leadership' ? `\nLEADERSHIP EXPERIENCE\n• Technical Lead: Guided team of 8 developers through successful product launch\n• Code Review: Established code review standards improving code quality by 35%\n• Mentoring: Created onboarding program reducing new hire ramp-up time by 40%` : ''}
${focus === 'impact' ? `\nIMPACT METRICS\n• Revenue Impact: Features built generated $2M+ in annual recurring revenue\n• User Growth: Contributed to 150% user base growth over 12 months\n• Cost Savings: Infrastructure optimization reduced cloud costs by 30%` : ''}
${focus === 'culture' ? `\nCULTURE & VALUES\n• Innovation: Filed 3 patents for novel technical solutions\n• Collaboration: Cross-functional work with product, design, and marketing teams\n• Growth Mindset: Completed 200+ hours of professional development annually` : ''}`;

  return {
    text,
    tips: [
      `Tailor the technical skills section to match ${companyName}'s tech stack`,
      'Quantify achievements with specific metrics whenever possible',
      'Include keywords from the job description for ATS optimization',
      'Keep the resume to 2 pages maximum for optimal readability',
    ],
    keywords: ['system design', 'microservices', 'cloud architecture', 'agile', 'scrum', 'technical leadership'],
  };
}

function generateCoverLetter(profile, params) {
  const { companyName, position, tone, jobDescription } = params;
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Your Name';
  
  const greetings = {
    professional: 'Dear Hiring Manager,',
    enthusiastic: 'Dear Amazing Team at ' + companyName + ',',
    confident: 'Dear ' + companyName + ' Recruitment Team,',
    humble: 'Dear Hiring Committee,',
  };

  const closings = {
    professional: 'Thank you for considering my application. I look forward to discussing how my skills align with your needs.',
    enthusiastic: 'I would be thrilled to bring my passion and skills to ' + companyName + '. Thank you for your consideration!',
    confident: 'I am confident I would be a valuable addition to your team. I welcome the opportunity to discuss this further.',
    humble: 'I appreciate your time reviewing my application and would be grateful for the opportunity to contribute.',
  };

  const text = `${greetings[tone] || greetings.professional}

I am writing to express my strong interest in the ${position} position at ${companyName}. With my background in ${profile?.coreStack || 'software development'} and passion for building impactful technology, I am excited about the opportunity to contribute to your team.

${jobDescription ? `After reviewing the role requirements, I believe my experience aligns well with your needs. ` : ''}Throughout my career, I have developed expertise in building scalable applications, collaborating with cross-functional teams, and delivering high-quality solutions that drive business results.

In my current role, I have successfully led the development of microservices architecture serving over 100,000 daily users, reducing API response times by 40% and mentoring junior developers to improve team productivity by 25%. These experiences have strengthened my technical leadership and problem-solving abilities.

What particularly draws me to ${companyName} is your commitment to innovation and excellence. I am impressed by [specific company achievement or value], and I am eager to contribute to your mission of [company mission or goal].

${tone === 'enthusiastic' ? 'The energy and innovation at ' + companyName + ' truly excites me, and I am passionate about the possibility of contributing to such a dynamic team.' : ''}
${tone === 'humble' ? 'While I am proud of my accomplishments, I am equally eager to learn from the talented team at ' + companyName + ' and continue growing as a developer.' : ''}

I would welcome the opportunity to discuss how my skills and experience can contribute to ${companyName}'s continued success. Thank you for your time and consideration.

${closings[tone] || closings.professional}

Sincerely,
${name}`;

  return {
    text,
    tips: [
      'Research ' + companyName + ' thoroughly and mention specific projects or values',
      'Keep the letter to one page maximum',
      'Use specific examples from your experience to demonstrate value',
      'Proofread carefully for grammar and spelling errors',
    ],
    keywords: [companyName, position, 'innovation', 'collaboration', 'technical excellence', 'problem-solving'],
  };
}

function generateInterviewAnswers(profile, params) {
  const { focus, tone, jobDescription } = params;
  const experienceLevel = tone || 'senior';
  
  const questions = {
    behavioral: [
      {
        question: 'Tell me about a time you faced a significant technical challenge.',
        answer: `Situation: In my current role, we experienced a critical performance issue where our API response times increased from 200ms to 2 seconds during peak traffic.\n\nTask: As the lead developer, I was responsible for identifying the root cause and implementing a solution within 48 hours.\n\nAction: I started by analyzing our monitoring dashboards and identified that a recent database query change was causing full table scans. I then implemented a multi-pronged approach: optimized the database queries, added Redis caching for frequently accessed data, and implemented connection pooling.\n\nResult: Within 24 hours, we reduced API response times back to 150ms, actually improving upon the original performance. This experience taught me the importance of monitoring, systematic debugging, and having fallback strategies.`,
      },
      {
        question: 'Describe a situation where you had to collaborate with a difficult team member.',
        answer: `Situation: I worked with a senior developer who was resistant to adopting new technologies and preferred legacy approaches.\n\nTask: I needed to convince the team to migrate our monolithic application to microservices without creating conflict.\n\nAction: Instead of pushing for immediate change, I scheduled one-on-one meetings to understand their concerns. I learned they worried about reliability and team readiness. I proposed a gradual migration starting with a low-risk module, created comprehensive documentation, and offered to pair-program during the transition.\n\nResult: The successful pilot project convinced the team, and we completed the migration over 6 months. The developer became one of the biggest advocates for the new architecture, and our deployment frequency increased by 300%.`,
      },
    ],
    technical: [
      {
        question: 'How would you design a URL shortener like bit.ly?',
        answer: `I would design this system considering scalability, reliability, and performance:\n\n1. **Core Components:**\n   - API Gateway for request routing\n   - Application servers for business logic\n   - Database for URL storage (NoSQL for high write throughput)\n   - Cache layer (Redis) for frequent lookups\n\n2. **URL Generation:**\n   - Use Base62 encoding of auto-incrementing ID or hash\n   - Collision detection with retry mechanism\n   - Custom alias support with validation\n\n3. **Database Schema:**\n   - URL mapping table with short_url, original_url, created_at, expires_at\n   - User table for analytics and management\n   - Click tracking table for analytics\n\n4. **Scalability:**\n   - Horizontal scaling of application servers\n   - Database sharding by short_url hash\n   - CDN for static assets\n   - Rate limiting to prevent abuse\n\n5. **Performance:**\n   - Cache hot URLs in Redis (90%+ hit rate)\n   - Database read replicas for analytics\n   - Async processing for click tracking`,
      },
    ],
    situational: [
      {
        question: 'How would you handle a situation where a project deadline is at risk?',
        answer: `I would take a systematic approach to address the deadline risk:\n\n1. **Assessment:**\n   - Identify the specific blockers and their impact\n   - Quantify the gap between current progress and deadline\n   - Assess available resources and their capacity\n\n2. **Communication:**\n   - Immediately inform stakeholders about the risk\n   - Present a clear picture of the situation without blame\n   - Propose options with trade-offs\n\n3. **Action Plan:**\n   - Prioritize features using MoSCoW method\n   - Identify what can be deferred vs. must-have\n   - Consider temporary solutions or MVPs\n   - Reallocate resources if needed\n\n4. **Execution:**\n   - Daily standups to track progress\n   - Remove blockers proactively\n   - Maintain quality standards\n   - Document decisions and rationale\n\n5. **Prevention:**\n   - Implement buffer time in future estimates\n   - Improve monitoring and early warning systems\n   - Build in regular checkpoints`,
      },
    ],
    leadership: [
      {
        question: 'How do you approach mentoring junior developers?',
        answer: `My mentoring approach focuses on creating a supportive environment for growth:\n\n1. **Assessment:**\n   - Understand their current skill level and goals\n   - Identify knowledge gaps and learning style\n   - Set clear, achievable milestones\n\n2. **Structure:**\n   - Weekly 1:1 meetings for guidance and feedback\n   - Code reviews with constructive, educational comments\n   - Pair programming sessions for complex problems\n   - Gradual increase in responsibility and autonomy\n\n3. **Knowledge Sharing:**\n   - Create documentation and learning resources\n   - Share relevant articles, courses, and books\n   - Explain the 'why' behind technical decisions\n   - Encourage questions and curiosity\n\n4. **Feedback Loop:**\n   - Regular, specific feedback on performance\n   - Celebrate wins and progress\n   - Address areas for improvement constructively\n   - Adjust mentoring style based on what works\n\n5. **Long-term Development:**\n   - Help them build a career roadmap\n   - Connect them with opportunities for growth\n   - Prepare them for increased responsibility\n   - Support their transition to independence`,
      },
    ],
  };

  const selectedQuestions = questions[focus] || questions.behavioral;
  
  const text = `INTERVIEW PREPARATION - ${focus.toUpperCase()} QUESTIONS

${selectedQuestions.map((q, i) => `
${i + 1}. ${q.question}

SUGGESTED ANSWER:
${q.answer}
`).join('\n')}

ADDITIONAL TIPS:
• Use the STAR method for behavioral questions (Situation, Task, Action, Result)
• Quantify your achievements whenever possible
• Show enthusiasm and cultural fit
• Prepare thoughtful questions about the role and company
• Practice your answers out loud before the interview`;

  return {
    text,
    tips: [
      'Practice answering out loud to build confidence',
      'Prepare specific examples from your experience',
      'Research the company and role thoroughly',
      'Have questions ready to ask the interviewer',
    ],
    keywords: ['STAR method', 'behavioral questions', 'technical assessment', 'system design', 'leadership'],
  };
}

function generateEmail(profile, params) {
  const { focus, tone, companyName, jobDescription } = params;
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Your Name';
  
  const templates = {
    followup: `Subject: Following Up - ${position || 'Position'} Application

Dear [Hiring Manager's Name],

I hope this email finds you well. I wanted to follow up on my application for the ${position || 'position'} at ${companyName || '[Company Name]'} submitted on [Date].

I remain very interested in this opportunity and believe my skills in ${profile?.coreStack || 'software development'} would be a valuable addition to your team. I would welcome the chance to discuss how my experience aligns with your needs.

Please let me know if you need any additional information from me. I am available at your convenience for an interview.

Thank you for your time and consideration.

Best regards,
${name}`,

    thankyou: `Subject: Thank You - ${position || 'Position'} Interview

Dear [Interviewer's Name],

Thank you for taking the time to meet with me today to discuss the ${position || 'position'} at ${companyName || '[Company Name]'}. I truly enjoyed learning more about the role and your team.

Our conversation reinforced my interest in this opportunity. I am particularly excited about [specific topic discussed], and I believe my experience in ${profile?.coreStack || 'software development'} would allow me to make meaningful contributions.

Please don't hesitate to reach out if you need any additional information. I look forward to hearing about the next steps.

Best regards,
${name}`,

    networking: `Subject: Connecting - Fellow ${profile?.coreStack?.split(',')[0] || 'Software'} Developer

Hi [Name],

I came across your profile while researching ${companyName || '[Company Name]'} and was impressed by your work in [specific area]. I'm a ${profile?.coreStack || 'software developer'} with experience in [relevant experience], and I'm very interested in learning more about your team.

Would you be open to a brief 15-minute chat about your experience at ${companyName || '[Company Name]'}? I'd love to hear your perspective on the culture and technical challenges.

I understand you're busy, so any time you can spare would be greatly appreciated.

Best regards,
${name}`,

    status: `Subject: Application Status Inquiry - ${position || 'Position'}

Dear [Hiring Manager's Name],

I hope you're doing well. I wanted to check in regarding my application for the ${position || 'position'} at ${companyName || '[Company Name]'}, submitted on [Date].

I remain very enthusiastic about this opportunity and would love to learn about the status of my application. Please let me know if there's any additional information I can provide.

Thank you for your time and consideration.

Best regards,
${name}`,
  };

  return {
    text: templates[focus] || templates.followup,
    tips: [
      'Send follow-up emails 7-10 days after applying',
      'Personalize each email with specific details',
      'Keep emails concise and professional',
      'Proofread carefully before sending',
    ],
    keywords: ['follow-up', 'thank you', 'professional email', 'networking', 'application status'],
  };
}
