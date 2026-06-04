/**
 * Mailer config — API-based email sending via Resend.
 * Replaces SMTP to run smoothly in environments like Vercel and Render's free tier.
 * Implements exponential backoff retries.
 */
const { Resend } = require("resend");

let resendInstance;

function getResend() {
  if (resendInstance) return resendInstance;
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
}

async function sendMailWithRetry({ to, subject, html }, attempt = 1) {
  const client = getResend();
  if (!client) {
    console.warn("[Mailer] RESEND_API_KEY not configured — skipping email send");
    return null;
  }

  // Resend free tier has a default sender 'onboarding@resend.dev' or custom FROM_EMAIL
  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";

  try {
    const response = await client.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      throw new Error(response.error.message || "Unknown Resend error");
    }

    return response.data;
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
