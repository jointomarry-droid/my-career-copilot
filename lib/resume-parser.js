/**
 * Resume Parser & CV Tailoring Engine
 */

let pdfParseModule = null;

async function getPdfParse() {
  if (!pdfParseModule) {
    pdfParseModule = (await import('pdf-parse')).default;
  }
  return pdfParseModule;
}

async function extractTextFromPDF(pdfBuffer) {
  const pdfParse = await getPdfParse();
  const data = await pdfParse(pdfBuffer);
  return {
    text: data.text || '',
    numpages: data.numpages || 1,
  };
}

export async function parseResume(pdfBuffer) {
  const data = await extractTextFromPDF(pdfBuffer);
  const text = data.text;

  return {
    rawText: text,
    pages: data.numpages,
    firstName: extractField(text, ['first.?name', 'given.?name']),
    lastName: extractField(text, ['last.?name', 'family.?name', 'surname']),
    email: extractEmail(text),
    phone: extractPhone(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    certifications: extractCertifications(text),
    languages: extractLanguages(text),
  };
}

export async function tailorForApplication(profile, opportunity) {
  const prompt = `You are a world-class resume writer. Create a tailored resume summary for this application.

APPLICANT: ${JSON.stringify(profile, null, 2)}
OPPORTUNITY: ${opportunity.title} at ${opportunity.institution} (${opportunity.country})

Create a 150-word professional summary optimized for this position. Output ONLY the summary.`;

  const summary = await callLLMForTailoring(prompt);

  const coverLetterPrompt = `Write a 200-word cover letter for ${profile.firstName} ${profile.lastName} applying to ${opportunity.title} at ${opportunity.institution}. Output ONLY the body text.`;
  const coverLetter = await callLLMForTailoring(coverLetterPrompt);

  return { summary, coverLetter, tailoredSkills: highlightRelevantSkills(profile.skills, opportunity) };
}

export async function generateCoverLetter(profile, opportunity) {
  const prompt = `Write a professional 250-word cover letter body for ${profile.firstName} ${profile.lastName} applying to ${opportunity.title} at ${opportunity.institution}. Background: ${profile.bio}. Output ONLY the body paragraphs.`;
  return await callLLMForTailoring(prompt);
}

function extractField(text, patterns) {
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}[\\s:]+([A-Za-z\\s]+)`, 'i');
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return '';
}

function extractEmail(text) { return text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || ''; }
function extractPhone(text) { return text.match(/[\+]?[\d\s\-\(\)]{7,15}/)?.[0]?.trim() || ''; }

function extractEducation(text) {
  const edu = [];
  [/(?:Bachelor|B\.?Sc\.?)[^.]*?(?:University|College)[^.\n]*/gi, /(?:Master|M\.?Sc\.?|MBA)[^.]*?(?:University|College)[^.\n]*/gi, /(?:Ph\.?D\.?)[^.]*?(?:University|College)[^.\n]*/gi].forEach(p => {
    const m = text.match(p); if (m) edu.push(...m.map(x => x.trim()));
  });
  return edu;
}

function extractSkills(text) {
  const skills = ['JavaScript','TypeScript','Python','Java','React','Next\\.js','Node\\.js','Django','PostgreSQL','MongoDB','AWS','GCP','Docker','Kubernetes','Machine Learning','Deep Learning','TensorFlow','PyTorch','Git','Playwright','GraphQL','REST'];
  return skills.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text)).map(s => s.replace(/\\\./g, '.'));
}

function extractExperience(text) {
  const m = text.match(/(\d{4})\s*[-–]\s*(?:Present|\d{4})[^.\n]*/gi);
  return m ? m.slice(0, 5).map(x => x.trim()) : [];
}

function extractCertifications(text) {
  const certs = [];
  [/AWS Certified[^.\n]*/gi, /Google Cloud[^.\n]*/gi, /IELTS[^.\n]*/gi].forEach(p => {
    const m = text.match(p); if (m) certs.push(...m.map(x => x.trim()));
  });
  return certs;
}

function extractLanguages(text) {
  const m = text.match(/(?:English|German|French|Spanish|Dutch|Mandarin|Japanese|Korean|Arabic|Portuguese|Italian|Turkish|Hindi|Urdu)[^.\n]*/gi);
  return m ? m.map(x => x.trim()) : [];
}

function highlightRelevantSkills(skills, opportunity) {
  const text = `${opportunity.title} ${opportunity.institution}`.toLowerCase();
  return skills.filter(s => text.includes(s.toLowerCase()));
}

async function callLLMForTailoring(prompt) {
  const LLM_API_KEY = process.env.LLM_API_KEY || '';
  if (!LLM_API_KEY) return mockTailoringResponse(prompt);

  try {
    const response = await fetch(process.env.LLM_API_ENDPOINT || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': LLM_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) throw new Error(`LLM error: ${response.status}`);
    const data = await response.json();
    return data.content[0]?.text || '';
  } catch (err) {
    return mockTailoringResponse(prompt);
  }
}

function mockTailoringResponse(prompt) {
  if (prompt.includes('cover letter')) {
    return `I am writing to express my strong interest in this opportunity. With my extensive background in AI systems, browser automation, and full-stack development, I am confident in my ability to contribute meaningfully to your team.\n\nMy experience building autonomous application pipelines and deep learning workflows has prepared me well for the challenges of this role. I look forward to discussing how my skills can benefit your organization.`;
  }
  return `Results-driven AI Engineer with expertise in autonomous systems, browser automation, and full-stack development. Proven track record of building scalable platforms that streamline complex workflows. Strong foundation in machine learning, deep learning, and modern web technologies.`;
}
