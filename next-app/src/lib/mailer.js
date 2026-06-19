/**
 * Mailer config — SMTP-based email sending via Nodemailer.
 * Supports any SMTP provider (Gmail, Outlook, custom SMTP, etc.)
 * Implements exponential backoff retries.
 *
 * Required env vars:
 *   SMTP_HOST     — e.g. "smtp.gmail.com"
 *   SMTP_PORT     — e.g. "587"
 *   SMTP_USER     — e.g. "you@gmail.com"
 *   SMTP_PASS     — e.g. "your-app-password"
 *   FROM_EMAIL    — e.g. "you@gmail.com" (defaults to SMTP_USER)
 */
const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMailWithRetry({ to, subject, html }, attempt = 1) {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Mailer] SMTP not configured — skipping email send");
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
    console.error(`[Mailer] Send failed (attempt ${attempt}/3): ${err.message}`);
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
    throw err;
  }
};
