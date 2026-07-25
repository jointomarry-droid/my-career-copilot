/**
 * Environment Variable Validator
 *
 * Runs on startup to validate all required environment variables.
 * Provides clear warnings for missing config without crashing.
 */

const REQUIRED_VARS = {
  MONGODB_URI: { description: 'MongoDB connection string', fallback: 'In-memory storage', required: false },
  LLM_API_KEY: { description: 'Anthropic Claude API key', fallback: 'Mock responses', required: false },
  SMTP_USER: { description: 'SMTP email username', fallback: 'Console logging', required: false },
  SMTP_PASS: { description: 'SMTP email password', fallback: 'Console logging', required: false },
};

const OPTIONAL_VARS = {
  MONGODB_DB: { default: 'career_copilot' },
  LLM_MODEL: { default: 'claude-sonnet-4-20250514' },
  LLM_API_ENDPOINT: { default: 'https://api.anthropic.com/v1/messages' },
  SMTP_HOST: { default: 'smtp.gmail.com' },
  SMTP_PORT: { default: '587' },
  FROM_EMAIL: { default: 'AI Career Copilot <copilot@careercopilot.ai>' },
  NOTIFICATION_EMAIL: { default: '' },
  SLACK_WEBHOOK_URL: { default: '' },
  TELEGRAM_BOT_TOKEN: { default: '' },
  TELEGRAM_CHAT_ID: { default: '' },
  DISCORD_WEBHOOK_URL: { default: '' },
  CUSTOM_WEBHOOK_URL: { default: '' },
  HEADLESS_MODE: { default: 'true' },
  PLAYWRIGHT_TIMEOUT_MS: { default: '60000' },
};

let validated = false;
let validationResults = [];

export function validateEnvironment() {
  if (validated) return validationResults;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       AI Career Copilot — Environment Check      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  validationResults = [];

  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[key];
    if (!value) {
      const msg = `⚠️  ${key}: ${config.description} — ${config.fallback}`;
      console.log(msg);
      validationResults.push({ key, status: 'missing', message: msg, ...config });
    } else {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`✅ ${key}: ${masked}`);
      validationResults.push({ key, status: 'configured', message: `${config.description} configured` });
    }
  }

  console.log('\n--- Optional Configuration ---');
  for (const [key, config] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[key];
    if (value) {
      console.log(`✅ ${key}: ${value}`);
      validationResults.push({ key, status: 'configured', message: `${key} set` });
    }
  }

  const configured = validationResults.filter(r => r.status === 'configured').length;
  const missing = validationResults.filter(r => r.status === 'missing').length;

  console.log(`\n📊 Summary: ${configured} configured, ${missing} missing`);
  console.log('🚀 System running in', missing > 0 ? 'DEGRADED' : 'FULL', 'mode\n');

  validated = true;
  return validationResults;
}

export function getEnvironmentStatus() {
  return {
    validated,
    results: validationResults,
    mode: validationResults.filter(r => r.status === 'missing').length > 0 ? 'degraded' : 'full',
  };
}

export default { validateEnvironment, getEnvironmentStatus };
