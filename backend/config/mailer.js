/**
 * Mailer config — Issue #15 Fix (SMTP TLS hardening)
 */
const nodemailer = require('nodemailer')

let transporter

function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    // Issue #15: secure:false + requireTLS:true forces STARTTLS upgrade
    // This prevents silent fallback to unencrypted connection
    secure:     false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      minVersion: 'TLSv1.2', // Reject TLS < 1.2
    },
  })

  return transporter
}

module.exports = async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP credentials not configured — skipping email send')
    return null
  }
  return getTransporter().sendMail({
    from:    `"Lokesh Sain" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}
