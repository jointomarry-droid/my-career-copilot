import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { role, profile, questionType } = await req.json();

    const questions = {
      behavioral: [
        'Tell me about a time you led a difficult project to success.',
        'Describe a situation where you had to resolve a conflict within your team.',
        'Give me an example of when you had to learn something quickly to solve a problem.',
        'Tell me about a time you failed. What did you learn?',
        'Describe a situation where you went above and beyond for a customer or colleague.',
      ],
      technical: [
        'How would you design a scalable system for [specific use case]?',
        'Explain the difference between [two relevant technologies] and when you would use each.',
        'Walk me through how you would debug a performance issue in production.',
        'How do you approach code review and ensuring code quality?',
        'Describe your experience with [relevant technology from resume].',
      ],
      cultural: [
        'What type of work environment do you thrive in?',
        'How do you handle ambiguity and changing priorities?',
        'What motivates you in your work?',
        'How do you approach collaboration with cross-functional teams?',
        'Where do you see yourself in 5 years?',
      ],
      leadership: [
        'How do you approach mentoring junior team members?',
        'Describe your leadership style.',
        'Tell me about a time you had to make a tough decision with incomplete information.',
        'How do you balance technical debt with feature delivery?',
        'How do you influence without authority?',
      ],
      all: [
        'Tell me about yourself and your background.',
        'Why are you interested in this role?',
        'What are your greatest strengths?',
        'What is your biggest weakness?',
        'Do you have any questions for us?',
      ]
    };

    const selectedType = questionType || 'all';
    const pool = questions[selectedType] || questions.all;
    const selectedQuestion = pool[Math.floor(Math.random() * pool.length)];

    const starBreakdown = {
      situation: 'Set the scene—what was the context and why did it matter?',
      task: 'What was your specific responsibility or challenge?',
      action: 'What steps did you take? Be specific about YOUR contributions.',
      result: 'What was the outcome? Quantify with metrics if possible.',
    };

    const sampleResponse = generateSampleAnswer(selectedQuestion, profile);

    return NextResponse.json({
      success: true,
      data: {
        question: selectedQuestion,
        type: selectedType,
        starGuide: starBreakdown,
        sampleAnswer: sampleResponse,
        tips: [
          'Keep answers under 2 minutes for behavioral questions.',
          'Use the STAR method (Situation, Task, Action, Result) for structure.',
          'Prepare 3-5 strong stories that demonstrate different competencies.',
          'Practice out loud—fluency improves with rehearsal.',
          'Research the company and tailor examples to their values.',
        ],
        followUp: [
          'Can you tell me more about the specific challenges you faced?',
          'How did you measure success in that situation?',
          'What would you do differently if faced with the same situation again?',
        ]
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateSampleAnswer(question, profile) {
  const name = profile?.name || 'the candidate';
  const role = profile?.targetRole || 'Software Engineer';
  const skills = profile?.skills || [];

  if (question.toLowerCase().includes('tell me about yourself')) {
    return `I am ${name}, a ${role} with a passion for building impactful software. ${skills.length > 0 ? `My expertise spans ${skills.slice(0, 3).join(', ')}, which I have applied` : 'I have applied'} across various projects to deliver reliable, scalable solutions. I am excited about this opportunity because it aligns with my goal of working on challenging problems at scale.`;
  }

  return `Using the STAR method: In my previous role, I faced a situation that required ${skills[0] || 'technical problem-solving'}. I took the initiative to [specific action], which resulted in [quantifiable outcome]. This experience taught me the importance of [relevant lesson] and strengthened my ability to ${role === 'Software Engineer' ? 'deliver high-quality code under pressure' : 'drive results in ambiguous situations'}.`;
}
