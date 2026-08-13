/**
 * Mailer config — Supports Resend HTTP API and Nodemailer SMTP (Gmail, Outlook, etc.)
 *
 * Env options:
 *   Option A (Recommended for Vercel):
 *     RESEND_API_KEY  — e.g. "re_123456789..."
 *     FROM_EMAIL      — e.g. "Lokesh Sain <onboarding@resend.dev>" or "contact@thelokeshsain.dev"
 *
 *   Option B (Gmail / Google Workspace with 2FA / Advanced Protection):
 *     SMTP_HOST       — e.g. "smtp.gmail.com"
 *     SMTP_PORT       — e.g. "465" or "587"
 *     SMTP_USER       — e.g. "iamlokeshsain@gmail.com"
 *     SMTP_PASS       — 16-character App Password from https://myaccount.google.com/apppasswords
 *     FROM_EMAIL      — e.g. "iamlokeshsain@gmail.com"
 */
const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || "465", 10);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, ""), // strip any spaces from App Password
    },
    pool: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
}

// Send email via Resend HTTP API (Zero SMTP dependency)
async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const from = process.env.FROM_EMAIL || "Lokesh Sain Portfolio <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Resend API error (${res.status}): ${errData.message || res.statusText}`);
  }

  return await res.json();
}

async function sendMailWithRetry({ to, subject, html }, attempt = 1) {
  // Option A: Try Resend API first if configured
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend({ to, subject, html });
    } catch (err) {
      console.error(`[Mailer] Resend API send failed: ${err.message}`);
    }
  }

  // Option B: Try SMTP (Nodemailer)
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Mailer] Neither Resend nor SMTP is configured — skipping email send (message saved in DB).");
    return null;
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    console.error(`[Mailer] SMTP send failed (attempt ${attempt}/3): ${err.message}`);
    if (attempt < 3) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendMailWithRetry({ to, subject, html }, attempt + 1);
    }
    throw err;
  }
}

module.exports = async function sendMail({ to, subject, html }) {
  try {
    return await sendMailWithRetry({ to, subject, html });
  } catch (err) {
    console.error("[Mailer] Permanent failure sending email:", err.message);
    // Don't crash request — return null so contact form creation still succeeds in DB
    return null;
  }
};
