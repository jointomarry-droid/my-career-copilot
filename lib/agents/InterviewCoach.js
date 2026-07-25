/**
 * Interview Coach Agent (v1.0)
 *
 * When an interview is detected, automatically:
 *   1. Researches the company (web scraping)
 *   2. Generates interview prep materials
 *   3. Creates common questions with suggested answers
 *   4. Provides salary intelligence
 *   5. Generates a pre-interview briefing document
 */

import { BrowserPool } from '../browser-pool.js';
import { generateFieldContent } from '../llm-filler.js';

export class InterviewCoachAgent {
  constructor() {
    this.name = 'Interview Coach Agent (v1.0)';
  }

  /**
   * Generate a complete interview preparation package
   */
  async prepareInterview(profile, opportunity) {
    console.log(`[${this.name}] Preparing interview package for: ${opportunity.title}`);

    const company = await this.researchCompany(opportunity.institution || opportunity.company);
    const questions = await this.generateQuestions(profile, opportunity, company);
    const briefing = await this.generateBriefing(profile, opportunity, company);
    const salary = await this.estimateSalary(opportunity);

    const package_ = {
      opportunity,
      company,
      questions,
      briefing,
      salary,
      preparedAt: new Date().toISOString(),
    };

    console.log(`[${this.name}] Interview package ready: ${questions.length} questions generated`);
    return package_;
  }

  /**
   * Research a company using web scraping
   */
  async researchCompany(companyName) {
    if (!companyName) return { name: 'Unknown', industry: 'Unknown', size: 'Unknown' };

    const pool = BrowserPool.getInstance();
    let browser, context, page, poolEntry;

    try {
      const acquired = await pool.acquire();
      browser = acquired.browser;
      context = acquired.context;
      poolEntry = acquired.poolEntry;
      page = await context.newPage();

      // Search for company info
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(companyName + ' company about')}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      const info = await page.evaluate(() => {
        const text = document.body.innerText;
        const desc = document.querySelector('[data-attrid="Description"]')?.innerText ||
          document.querySelector('.BNeawe')?.innerText || '';
        return {
          description: desc.substring(0, 500),
          found: true,
        };
      });

      return {
        name: companyName,
        description: info.description,
        industry: this.extractIndustry(info.description),
        size: this.extractSize(info.description),
        website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        found: info.found,
      };
    } catch (error) {
      console.warn(`[${this.name}] Company research failed:`, error.message);
      return {
        name: companyName,
        description: 'Research unavailable',
        industry: 'Unknown',
        size: 'Unknown',
        found: false,
      };
    } finally {
      if (poolEntry) pool.release(poolEntry);
    }
  }

  /**
   * Generate interview questions tailored to the role
   */
  async generateQuestions(profile, opportunity, company) {
    const questions = [
      {
        category: 'Introduction',
        question: 'Tell me about yourself.',
        suggestedAnswer: `I'm ${profile.firstName} ${profile.lastName}, a professional with expertise in ${profile.coreStack || 'technology'}. ${profile.bio || 'I bring a strong technical background and passion for innovation.'} I'm excited about this ${opportunity.title} role because it aligns perfectly with my skills and career goals.`,
        tips: 'Keep it under 2 minutes. Focus on relevant experience.',
      },
      {
        category: 'Technical',
        question: `What experience do you have with ${profile.coreStack?.split(',')[0] || 'the core technologies'}?`,
        suggestedAnswer: `I have extensive experience with ${profile.coreStack?.split(',')[0] || 'the required technologies'}. In my previous roles, I've built scalable applications, implemented automation pipelines, and worked on complex system architectures. I'm particularly proud of my work on AI-powered automation systems.`,
        tips: 'Use the STAR method. Give specific examples with metrics.',
      },
      {
        category: 'Motivation',
        question: `Why do you want to work at ${company.name}?`,
        suggestedAnswer: `${company.name} stands out because of its innovative approach to ${company.industry || 'the industry'}. I've followed your work and I'm impressed by your commitment to excellence. This role offers the perfect opportunity to apply my skills in ${profile.coreStack?.split(',').slice(0, 2).join(' and ') || 'technology'} while growing in a dynamic environment.`,
        tips: 'Research recent company news. Show genuine interest.',
      },
      {
        category: 'Behavioral',
        question: 'Describe a challenging project you led.',
        suggestedAnswer: `In a previous role, I led a team to build an autonomous automation system that reduced manual work by 80%. The challenge was integrating multiple APIs and handling edge cases. I organized the work into sprints, implemented comprehensive testing, and delivered the project on time. The result was a system that processed 500+ applications daily.`,
        tips: 'Use STAR format: Situation, Task, Action, Result.',
      },
      {
        category: 'Salary',
        question: 'What are your salary expectations?',
        suggestedAnswer: `Based on my research and experience, I'm looking for a competitive salary in the range of ${salary?.range || 'market rate'}. I'm also interested in the total compensation package including benefits, growth opportunities, and the impact I can make.`,
        tips: 'Research market rates. Give a range, not a fixed number.',
      },
      {
        category: 'Questions',
        question: 'Do you have any questions for us?',
        suggestedAnswer: `Yes, I have a few:\n1. What does success look like in this role in the first 90 days?\n2. What are the biggest challenges the team is currently facing?\n3. How does this role contribute to the company's strategic goals?\n4. What's the team culture like?\n5. What opportunities are there for professional growth?`,
        tips: 'Always have 3-5 questions ready. Shows genuine interest.',
      },
    ];

    return questions;
  }

  /**
   * Generate a pre-interview briefing document
   */
  async generateBriefing(profile, opportunity, company) {
    return {
      title: `Interview Briefing: ${opportunity.title} at ${company.name}`,
      generatedAt: new Date().toISOString(),
      sections: {
        roleOverview: {
          title: 'Role Overview',
          content: `Position: ${opportunity.title}\nCompany: ${company.name}\nLocation: ${opportunity.country || 'Not specified'}\nIndustry: ${company.industry || 'Not specified'}`,
        },
        yourStrengths: {
          title: 'Your Key Strengths for This Role',
          content: `• Technical expertise: ${profile.coreStack || 'Strong technical background'}\n• Academic record: GPA ${profile.gpa || 'N/A'}, IELTS ${profile.ielts || 'N/A'}\n• Relevant experience in automation and AI systems\n• International perspective: ${profile.nationality || 'Global professional'}`,
        },
        companyIntel: {
          title: 'Company Intelligence',
          content: company.description || 'Company research pending. Review their website and recent news before the interview.',
        },
        dayOfChecklist: {
          title: 'Day-of Interview Checklist',
          items: [
            'Review this briefing document',
            'Test your camera/microphone (if virtual)',
            'Prepare a quiet, professional environment',
            'Have a copy of your resume ready',
            'Prepare 3-5 thoughtful questions',
            'Dress professionally (business casual minimum)',
            'Arrive/login 5-10 minutes early',
            'Bring a notebook for taking notes',
          ],
        },
      },
    };
  }

  /**
   * Estimate salary range for the position
   */
  async estimateSalary(opportunity) {
    const country = (opportunity.country || '').toLowerCase();
    const title = (opportunity.title || '').toLowerCase();

    const salaryData = {
      germany: { min: 45000, max: 85000, currency: 'EUR' },
      netherlands: { min: 40000, max: 80000, currency: 'EUR' },
      switzerland: { min: 80000, max: 150000, currency: 'CHF' },
      uk: { min: 35000, max: 75000, currency: 'GBP' },
      'united states': { min: 80000, max: 160000, currency: 'USD' },
      canada: { min: 60000, max: 120000, currency: 'CAD' },
      australia: { min: 70000, max: 130000, currency: 'AUD' },
    };

    const base = salaryData[country] || { min: 40000, max: 80000, currency: 'USD' };

    // Adjust for seniority
    let multiplier = 1;
    if (title.includes('senior') || title.includes('lead') || title.includes('principal')) multiplier = 1.3;
    if (title.includes('junior') || title.includes('entry')) multiplier = 0.7;
    if (title.includes('director') || title.includes('vp') || title.includes('head')) multiplier = 1.6;

    return {
      min: Math.round(base.min * multiplier),
      max: Math.round(base.max * multiplier),
      currency: base.currency,
      range: `${base.currency} ${Math.round(base.min * multiplier / 1000)}k — ${Math.round(base.max * multiplier / 1000)}k`,
      note: 'Estimate based on role, location, and market data. Actual salary may vary.',
    };
  }

  extractIndustry(text) {
    const industries = ['technology', 'finance', 'healthcare', 'education', 'manufacturing', 'energy', 'retail', 'consulting'];
    const lower = (text || '').toLowerCase();
    return industries.find(i => lower.includes(i)) || 'Technology';
  }

  extractSize(text) {
    const lower = (text || '').toLowerCase();
    if (lower.includes('startup') || lower.includes('small')) return 'Small (1-50)';
    if (lower.includes('enterprise') || lower.includes('multinational')) return 'Enterprise (1000+)';
    if (lower.includes('mid-size') || lower.includes('growing')) return 'Mid-size (100-1000)';
    return 'Unknown';
  }
}

export default InterviewCoachAgent;
