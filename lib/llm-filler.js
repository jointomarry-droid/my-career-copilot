/**
 * LLM Smart Form Filler Integration
 */

const LLM_API_ENDPOINT = process.env.LLM_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-20250514';

export async function generateFieldContent(fieldInfo, userProfile) {
  if (fieldMatchesKnownField(fieldInfo, 'firstName')) return userProfile.firstName;
  if (fieldMatchesKnownField(fieldInfo, 'lastName')) return userProfile.lastName;
  if (fieldMatchesKnownField(fieldInfo, 'email')) return userProfile.email;
  if (fieldMatchesKnownField(fieldInfo, 'phone')) return userProfile.phone;

  const prompt = buildPromptForField(fieldInfo, userProfile);
  return await callLLMAPI(prompt);
}

function fieldMatchesKnownField(field, type) {
  const patterns = {
    firstName: ['first.name', 'firstname', 'fname', 'given-name'],
    lastName: ['last.name', 'lastname', 'lname', 'family-name', 'surname'],
    email: ['email', 'e.mail', 'mail'],
    phone: ['phone', 'telephone', 'mobile', 'contact.number'],
  };
  const keywords = patterns[type] || [];
  const checkString = `${field.id} ${field.name} ${field.label} ${field.placeholder}`.toLowerCase();
  return keywords.some(kw => checkString.includes(kw));
}

function buildPromptForField(field, profile) {
  const isEssay = field.type === 'textarea' || field.label.toLowerCase().includes('motivation') || field.label.toLowerCase().includes('statement');
  const isShort = field.type === 'input' || field.type === 'text';

  return `You are an assistant filling out an international application form.
The user's profile:\n${JSON.stringify(profile, null, 2)}\n
Form field: Label="${field.label}" Placeholder="${field.placeholder}" Type="${field.type}" Required="${field.required}"
Generate a ${isEssay ? 'compelling 300-word essay' : isShort ? 'concise one-sentence answer' : 'short paragraph'}
for this field. Do NOT include any extra explanation or markdown; output only the content.`;
}

async function callLLMAPI(prompt) {
  if (!LLM_API_KEY) {
    console.warn('[LLM-Filler] No API key set, returning mock response.');
    return mockResponseForField(prompt);
  }

  const response = await fetch(LLM_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LLM_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API responded with ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

function mockResponseForField(prompt) {
  if (prompt.includes('motivation') || prompt.includes('statement') || prompt.includes('textarea')) {
    return `I am a dedicated AI engineer with extensive experience in full-stack development and a passion for creating automation pipelines that solve real-world challenges. My journey in technology has been driven by a desire to build tools that streamline complex processes. I have demonstrated strong leadership in cross-functional teams and believe my background aligns perfectly with the goals of this prestigious program. I am eager to bring my unique perspective and technical expertise to contribute meaningfully and learn from the global community.`;
  }
  return 'Experienced software engineer specializing in AI automation and web architecture.';
}

export default generateFieldContent;
