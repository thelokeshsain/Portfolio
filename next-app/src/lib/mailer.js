/**
 * Mailer config — Supports Resend HTTP API (recommended for Vercel & Advanced Protection) and Nodemailer SMTP.
 *
 * Env options:
 *   Option A (Recommended for Vercel & Advanced Protection):
 *     RESEND_API_KEY  — e.g. "re_123456789..."
 *     OWNER_EMAIL     — e.g. "iamlokeshsain@gmail.com"
 *
 *   Option B (SMTP fallback):
 *     SMTP_HOST       — e.g. "smtp.gmail.com"
 *     SMTP_PORT       — e.g. "465"
 *     SMTP_USER       — e.g. "iamlokeshsain@gmail.com"
 *     SMTP_PASS       — 16-character App Password
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
      pass: process.env.SMTP_PASS.replace(/\s+/g, ""),
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

  // IMPORTANT: For unverified domain addresses (e.g. gmail.com), Resend requires sending from onboarding@resend.dev
  let from = process.env.RESEND_FROM_EMAIL || "Lokesh Sain Portfolio <onboarding@resend.dev>";
  if (from.includes("@gmail.com")) {
    from = "Lokesh Sain Portfolio <onboarding@resend.dev>";
  }

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
  // Option 1: Use Resend API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resendResult = await sendViaResend({ to, subject, html });
      if (resendResult) return resendResult;
    } catch (err) {
      console.error(`[Mailer] Resend API send failed: ${err.message}`);
      // Do not fall back to SMTP if SMTP is unconfigured or failing BadCredentials
    }
    return null;
  }

  // Option 2: Fall back to SMTP only if Resend API key is not provided
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
      const delay = Math.pow(2, attempt) * 1000;
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
    return null;
  }
};
