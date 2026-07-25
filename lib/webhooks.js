/**
 * Webhook Integration System
 *
 * Sends notifications to external services:
 *   - Slack (via incoming webhooks)
 *   - Telegram (via Bot API)
 *   - Discord (via webhooks)
 *   - Custom HTTP endpoints
 *
 * Events that trigger webhooks:
 *   - application.submitted
 *   - application.failed
 *   - discovery.found
 *   - campaign.completed
 *   - agent.error
 */

const WEBHOOK_CONFIG = {
  slack: {
    url: process.env.SLACK_WEBHOOK_URL || '',
    enabled: !!process.env.SLACK_WEBHOOK_URL,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
  },
  discord: {
    url: process.env.DISCORD_WEBHOOK_URL || '',
    enabled: !!process.env.DISCORD_WEBHOOK_URL,
  },
  custom: {
    url: process.env.CUSTOM_WEBHOOK_URL || '',
    secret: process.env.CUSTOM_WEBHOOK_SECRET || '',
    enabled: !!process.env.CUSTOM_WEBHOOK_URL,
  },
};

class WebhookIntegration {
  constructor() {
    this.config = WEBHOOK_CONFIG;
    this.queue = [];
    this.processing = false;
  }

  /**
   * Send a webhook event to all configured providers
   */
  async notify(event) {
    const results = [];

    if (this.config.slack.enabled) {
      results.push(await this.sendSlack(event));
    }
    if (this.config.telegram.enabled) {
      results.push(await this.sendTelegram(event));
    }
    if (this.config.discord.enabled) {
      results.push(await this.sendDiscord(event));
    }
    if (this.config.custom.enabled) {
      results.push(await this.sendCustom(event));
    }

    if (results.length === 0) {
      console.log(`[Webhook] No providers configured. Event: ${event.type}`);
    }

    return results;
  }

  /**
   * Format and send to Slack
   */
  async sendSlack(event) {
    const slackMessage = this.formatSlackMessage(event);
    try {
      const res = await fetch(this.config.slack.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });
      return { provider: 'slack', success: res.ok, status: res.status };
    } catch (err) {
      return { provider: 'slack', success: false, error: err.message };
    }
  }

  formatSlackMessage(event) {
    const emoji = {
      'application.submitted': '✅',
      'application.failed': '❌',
      'application.auto_applied': '🚀',
      'discovery.found': '🔍',
      'campaign.completed': '📊',
      'agent.error': '⚠️',
    }[event.type] || '📋';

    const color = event.type.includes('failed') || event.type.includes('error') ? '#ff4444'
      : event.type.includes('submitted') ? '#00cc88'
        : '#00d4ff';

    return {
      attachments: [{
        color,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `${emoji} Career Copilot Event` },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Event:*\n${event.type}` },
              { type: 'mrkdwn', text: `*Time:*\n${new Date().toLocaleString()}` },
            ],
          },
          event.details?.title ? {
            type: 'section',
            text: { type: 'mrkdwn', text: `*${event.details.title}*\n${event.details.institution || ''} — ${event.details.country || ''}` },
          } : null,
          event.details?.error ? {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Error:*\n\`${event.details.error}\`` },
          } : null,
        ].filter(Boolean),
      }],
    };
  }

  /**
   * Format and send to Telegram
   */
  async sendTelegram(event) {
    const text = this.formatTelegramMessage(event);
    const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.telegram.chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      return { provider: 'telegram', success: res.ok, status: res.status };
    } catch (err) {
      return { provider: 'telegram', success: false, error: err.message };
    }
  }

  formatTelegramMessage(event) {
    const emoji = {
      'application.submitted': '✅',
      'application.failed': '❌',
      'application.auto_applied': '🚀',
      'discovery.found': '🔍',
      'campaign.completed': '📊',
      'agent.error': '⚠️',
    }[event.type] || '📋';

    let msg = `<b>${emoji} AI Career Copilot</b>\n\n`;
    msg += `<b>Event:</b> ${event.type}\n`;
    msg += `<b>Time:</b> ${new Date().toLocaleString()}\n`;

    if (event.details?.title) {
      msg += `\n<b>${event.details.title}</b>\n`;
      msg += `${event.details.institution || ''} — ${event.details.country || ''}\n`;
    }
    if (event.details?.error) {
      msg += `\n⚠️ Error: <code>${event.details.error}</code>\n`;
    }

    return msg;
  }

  /**
   * Format and send to Discord
   */
  async sendDiscord(event) {
    const embed = this.formatDiscordEmbed(event);
    try {
      const res = await fetch(this.config.discord.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
      return { provider: 'discord', success: res.ok, status: res.status };
    } catch (err) {
      return { provider: 'discord', success: false, error: err.message };
    }
  }

  formatDiscordEmbed(event) {
    const color = event.type.includes('failed') || event.type.includes('error') ? 0xff4444
      : event.type.includes('submitted') ? 0x00cc88
        : 0x00d4ff;

    return {
      title: `Career Copilot: ${event.type}`,
      color,
      description: event.details?.title || event.type,
      fields: [
        { name: 'Type', value: event.type, inline: true },
        { name: 'Time', value: new Date().toLocaleString(), inline: true },
        event.details?.institution ? { name: 'Institution', value: event.details.institution, inline: true } : null,
        event.details?.country ? { name: 'Country', value: event.details.country, inline: true } : null,
        event.details?.error ? { name: 'Error', value: `\`${event.details.error}\``, inline: false } : null,
      ].filter(Boolean),
      footer: { text: 'AI Career Copilot' },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send to custom HTTP endpoint
   */
  async sendCustom(event) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.config.custom.secret) {
      headers['X-Webhook-Secret'] = this.config.custom.secret;
    }

    try {
      const res = await fetch(this.config.custom.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: event.type,
          timestamp: new Date().toISOString(),
          data: event.details,
          metadata: event.metadata,
        }),
      });
      return { provider: 'custom', success: res.ok, status: res.status };
    } catch (err) {
      return { provider: 'custom', success: false, error: err.message };
    }
  }

  /**
   * Get webhook configuration status
   */
  getConfig() {
    return {
      slack: { enabled: this.config.slack.enabled, configured: !!this.config.slack.url },
      telegram: { enabled: this.config.telegram.enabled, configured: !!this.config.telegram.botToken },
      discord: { enabled: this.config.discord.enabled, configured: !!this.config.discord.url },
      custom: { enabled: this.config.custom.enabled, configured: !!this.config.custom.url },
    };
  }
}

export const webhooks = new WebhookIntegration();
export default webhooks;
