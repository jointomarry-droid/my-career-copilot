import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages, mode, profile, recentApplications } = await request.json();

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    const response = generateAIResponse(lastUserMessage, mode, profile, recentApplications);

    return NextResponse.json({
      success: true,
      response: response.text,
      suggestions: response.suggestions,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateAIResponse(message, mode, profile, recentApplications) {
  const lowerMessage = message.toLowerCase();

  if (mode === 'interview') {
    return generateInterviewResponse(lowerMessage, profile);
  } else if (mode === 'resume') {
    return generateResumeResponse(lowerMessage, profile);
  } else if (mode === 'negotiate') {
    return generateNegotiationResponse(lowerMessage, profile);
  } else if (mode === 'networking') {
    return generateNetworkingResponse(lowerMessage, profile);
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      text: `Hello! I'm your AI Career Assistant. I see you have experience in ${profile?.coreStack || 'software development'}. How can I help you today?`,
      suggestions: ['Review my resume', 'Prepare for interviews', 'Career advice', 'Salary negotiation tips'],
    };
  }

  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return {
      text: `Based on your profile, here are some resume optimization suggestions:\n\n**Strengths:**\n• Strong technical skills in ${profile?.coreStack || 'multiple technologies'}\n• Active job search with ${recentApplications?.length || 0} applications\n\n**Areas to Improve:**\n• Add more quantifiable achievements (numbers, percentages)\n• Include relevant keywords from job descriptions\n• Ensure consistent formatting and ATS-friendly structure\n\nWould you like me to analyze a specific aspect of your resume?`,
      suggestions: ['ATS optimization tips', 'Keyword analysis', 'Format recommendations', 'Cover letter help'],
    };
  }

  if (lowerMessage.includes('interview') || lowerMessage.includes('prepare')) {
    return {
      text: `Great! Let me help you prepare for interviews. Based on your background:\n\n**Common Questions You Should Practice:**\n1. Tell me about yourself (2-min pitch)\n2. Why are you interested in this role?\n3. Describe a challenging project you worked on\n4. How do you handle tight deadlines?\n5. Where do you see yourself in 5 years?\n\n**Technical Preparation:**\n• Review data structures and algorithms\n• Practice system design questions\n• Prepare examples of past work\n\nShall I create a personalized practice session?`,
      suggestions: ['Mock interview', 'Technical questions', 'Behavioral questions', 'Salary negotiation'],
    };
  }

  if (lowerMessage.includes('salary') || lowerMessage.includes('negotiate') || lowerMessage.includes('compensation')) {
    return {
      text: `**Salary Negotiation Tips:**\n\n1. **Research Market Rate**\n   • Use Glassdoor, Levels.fyi, and Payscale\n   • Consider location, experience, and company size\n\n2. **Know Your Worth**\n   • Your skills in ${profile?.coreStack || 'software development'} are in high demand\n   • Factor in total compensation (base + bonus + equity + benefits)\n\n3. **Negotiation Strategy**\n   • Start with a range, not a specific number\n   • Always negotiate the first offer\n   • Get competing offers when possible\n\n4. **Beyond Base Salary**\n   • Remote work flexibility\n   • Additional PTO\n   • Learning budget\n   • Stock options\n\nWould you like help preparing a specific negotiation?`,
      suggestions: ['Counter-offer template', 'Total comp calculator', 'Market rate lookup', 'Practice script'],
    };
  }

  if (lowerMessage.includes('career') || lowerMessage.includes('advice') || lowerMessage.includes('path')) {
    return {
      text: `**Career Growth Recommendations:**\n\nBased on your current trajectory, here are strategic moves to consider:\n\n**Short-term (1-2 years):**\n• Deepen expertise in ${profile?.coreStack?.split(',')[0]?.trim() || 'your primary technology'}\n• Build a portfolio of 3-5 notable projects\n• Earn relevant certifications\n\n**Medium-term (2-4 years):**\n• Transition to senior or lead role\n• Start mentoring junior developers\n• Contribute to open-source projects\n\n**Long-term (4+ years):**\n• Consider specialization (AI/ML, Cloud, Security)\n• Explore management track if interested\n• Build personal brand through writing/speaking\n\nWhat specific area would you like to focus on?`,
      suggestions: ['Skill development plan', 'Networking strategy', 'Job market trends', 'Interview preparation'],
    };
  }

  return {
    text: `I understand you're asking about "${message}". Let me help you with that.\n\nHere are some relevant insights:\n\n• **Your Profile:** You have strong skills in ${profile?.coreStack || 'software development'}\n• **Current Status:** ${recentApplications?.length || 0} active applications\n• **Recommendation:** Focus on quality over quantity in your applications\n\nWhat specific aspect would you like me to elaborate on?`,
    suggestions: ['Resume optimization', 'Interview tips', 'Career advice', 'Salary negotiation'],
  };
}

function generateInterviewResponse(message, profile) {
  if (message.includes('technical') || message.includes('coding')) {
    return {
      text: `**Technical Interview Preparation:**\n\n**Data Structures & Algorithms:**\n• Arrays, Linked Lists, Trees, Graphs\n• Sorting algorithms (Quick, Merge, Heap)\n• Dynamic Programming patterns\n\n**System Design:**\n• Scalability patterns\n• Database design\n• API design principles\n• Caching strategies\n\n**Practice Problems:**\n1. Two Sum (Easy)\n2. LRU Cache (Medium)\n3. Design URL Shortener (System Design)\n\nShall I generate a practice problem for you?`,
      suggestions: ['Generate coding problem', 'System design question', 'Behavioral questions', 'Mock interview'],
    };
  }

  return {
    text: `**Interview Tips:**\n\n1. **Research the Company**\n   • Mission and values\n   • Recent news and products\n   • Tech stack they use\n\n2. **STAR Method for Behavioral Questions:**\n   • Situation: Set the context\n   • Task: Describe your responsibility\n   • Action: Explain what you did\n   • Result: Share the outcome\n\n3. **Questions to Ask:**\n   • What does success look like in this role?\n   • How does the team handle technical debt?\n   • What's the growth path for this position?`,
    suggestions: ['Behavioral questions', 'Technical prep', 'Salary negotiation', 'Company research'],
  };
}

function generateResumeResponse(message, profile) {
  return {
    text: `**Resume Optimization Analysis:**\n\n**Current Strengths:**\n• Technical skills in ${profile?.coreStack || 'relevant technologies'}\n• Active project experience\n\n**Improvements Needed:**\n1. Add metrics to achievements (e.g., "Reduced load time by 40%")\n2. Use action verbs (Built, Implemented, Optimized)\n3. Tailor keywords to each job description\n4. Ensure consistent formatting\n\n**ATS Optimization:**\n• Use standard section headings\n• Include relevant keywords naturally\n• Avoid tables and complex formatting\n• Save as both PDF and Word format`,
    suggestions: ['Keyword analysis', 'Format review', 'Cover letter tips', 'LinkedIn optimization'],
  };
}

function generateNegotiationResponse(message, profile) {
  return {
    text: `**Salary Negotiation Script:**\n\n**Opening:**\n"Thank you for the offer. I'm excited about the opportunity. I'd like to discuss the compensation package."\n\n**Counter-offer:**\n"Based on my research and experience, I was expecting a range of $X-$Y. Given my skills in ${profile?.coreStack || 'relevant technologies'}, I believe $Z would be more appropriate."\n\n**If They Can't Move on Base:**\n• "Could we discuss additional PTO?"\n• "What about a signing bonus?"\n• "Is there flexibility for remote work?"\n• "Can we include a performance review at 6 months?"\n\n**Closing:**\n"I appreciate you working with me on this. I'm looking forward to contributing to the team."`,
    suggestions: ['Practice this script', 'Research market rates', 'Counter-offer email template', 'Benefits negotiation'],
  };
}

function generateNetworkingResponse(message, profile) {
  return {
    text: `**Networking Strategy:**\n\n**LinkedIn Optimization:**\n• Update headline with value proposition\n• Share industry insights weekly\n• Engage with target company posts\n\n**Effective Outreach Template:**\n"Hi [Name], I noticed we both [connection point]. I'm currently [your situation] and would love to learn about your experience at [Company]. Would you have 15 minutes for a quick chat?"\n\n**Follow-up Tips:**\n1. Send connection request with personalized note\n2. Engage with their content before reaching out\n3. Offer value before asking for help\n4. Always send a thank-you note`,
    suggestions: ['Connection templates', 'LinkedIn tips', 'Industry events', 'Follow-up sequences'],
  };
}
