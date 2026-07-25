/**
 * Email Notification System
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Career Copilot <copilot@careercopilot.ai>';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function sendEmail(to, subject, htmlBody) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Notifier] Email queued (no SMTP): "${subject}" to ${to}`);
    return { queued: true, subject, to };
  }
  try {
    const result = await transport.sendMail({ from: FROM_EMAIL, to, subject, html: htmlBody });
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    return { sent: false, error: err.message };
  }
}

function getStatusColor(status) {
  return { 'Submitted': '#00cc88', 'In Progress': '#00d4ff', 'Failed': '#ff4444', 'Queued': '#ffcc00' }[status] || '#888';
}

export async function notifyApplicationStatus(userEmail, application, oldStatus, newStatus) {
  const subject = `[Career Copilot] Application ${newStatus}: ${application.title}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0B;color:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#00d4ff,#0099cc);padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:20px;color:#0A0A0B;">AI Career Copilot</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#0A0A0B;">Application Status Update</p>
      </div>
      <div style="padding:24px;">
        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="margin:0;font-size:12px;color:#888;">Status: <span style="color:${getStatusColor(newStatus)};font-weight:bold;">${newStatus}</span></p>
          <h2 style="margin:8px 0;font-size:16px;">${application.title}</h2>
          <p style="margin:0;font-size:13px;color:#999;">${application.institution || ''} — ${application.country || ''}</p>
        </div>
      </div>
      <div style="background:#111;padding:16px;text-align:center;font-size:11px;color:#666;">AI Career Copilot</div>
    </div>`;
  return await sendEmail(userEmail, subject, html);
}

export async function notifyNewDiscoveries(userEmail, discoveries) {
  if (!discoveries.length) return;
  const subject = `[Career Copilot] ${discoveries.length} New Opportunities Discovered`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0B;color:#fff;border-radius:8px;">
    <div style="background:linear-gradient(135deg,#00cc88,#00aa66);padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:20px;color:#0A0A0B;">New Discoveries</h1>
    </div>
    <div style="padding:24px;">${discoveries.map(d => `<p style="font-size:14px;border-bottom:1px solid #222;padding:8px 0;"><a href="${d.url}" style="color:#00d4ff;">${d.title}</a> — ${d.country}</p>`).join('')}</div>
  </div>`;
  return await sendEmail(userEmail, subject, html);
}

export async function notifyDailyDigest(userEmail, stats) {
  const subject = `[Career Copilot] Daily Digest`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0B;color:#fff;border-radius:8px;">
    <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:20px;">Daily Digest</h1>
    </div>
    <div style="padding:24px;text-align:center;">
      <p>Total: ${stats.total} | Submitted: ${stats.submitted} | Success: ${stats.successRate}%</p>
    </div>
  </div>`;
  return await sendEmail(userEmail, subject, html);
}
