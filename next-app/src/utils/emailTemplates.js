/**
 * Email Templates — Midnight Blueprint System
 * Cohesive engineering product identity:
 * - Base background: #05070A
 * - Card surface: #0B0F17
 * - Subsurface container: #0F141D
 * - Borders: #1E2638
 * - Brand accent: #38BDF8
 * - Email-safe hosted PNG logo: https://lokeshsain.vercel.app/images/email-logo.png
 * - Comprehensive plain-text fallbacks
 * - Strict HTML escaping to prevent injection
 */

const SITE_URL = "https://lokeshsain.vercel.app";
const EMAIL_LOGO_URL = "https://lokeshsain.vercel.app/images/email-logo.png";

function normaliseIp(ip) {
  if (!ip || ip === "—") return "Unknown";
  if (ip === "::1" || ip === "127.0.0.1") return "127.0.0.1 (localhost)";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createTemplate(html, text) {
  const result = { html, text };
  result.toString = () => html;
  return result;
}

/* ─── Base Email Layout ─── */
function baseLayout({ headerSubtitle, title, bodyHtml, footerNote = "Automated System Notification" }) {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="color-scheme" content="dark only"/>
<title>${esc(title)} — Lokesh Sain</title>
<style type="text/css">
  body,table,td,p,a,h1,h2{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block;}
  a{color:#38BDF8;text-decoration:none;}
  @media only screen and (max-width:600px){
    .email-container{width:100%!important;}
    .content-cell{padding:24px 18px!important;}
    .header-cell{padding:20px 18px!important;}
    .footer-cell{padding:16px 18px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#05070A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#F0F2F5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#05070A;padding:36px 12px;">
  <tr>
    <td align="center" valign="top">
      <table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:580px;background-color:#0B0F17;border:1px solid #1E2638;border-radius:14px;overflow:hidden;">
        <!-- Top Accent Bar -->
        <tr>
          <td style="height:3px;background-color:#38BDF8;"></td>
        </tr>

        <!-- Brand Header Bar -->
        <tr>
          <td class="header-cell" style="padding:20px 28px;background-color:#0B0F17;border-bottom:1px solid #1E2638;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="42" valign="middle">
                  <a href="${SITE_URL}" style="text-decoration:none;">
                    <img src="${EMAIL_LOGO_URL}" width="36" height="36" alt="LS" style="display:block;border-radius:8px;border:1px solid #1E2638;background-color:#05070A;" />
                  </a>
                </td>
                <td valign="middle" style="padding-left:12px;">
                  <div style="font-size:15px;font-weight:800;color:#F0F2F5;letter-spacing:-0.02em;">Lokesh Sain</div>
                  <div style="font-size:11px;color:#8B93A7;font-family:monospace;margin-top:2px;">${esc(headerSubtitle || "Midnight Blueprint · Portfolio System")}</div>
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;font-size:10px;font-family:monospace;font-weight:700;letter-spacing:0.08em;color:#38BDF8;background-color:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);padding:3px 8px;border-radius:4px;text-transform:uppercase;">Verified</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td class="content-cell" style="padding:32px 28px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer-cell" style="padding:18px 28px;background-color:#070A0F;border-top:1px solid #1E2638;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:#8B93A7;font-family:monospace;">
                  &#169; ${year} <a href="${SITE_URL}" style="color:#38BDF8;font-weight:bold;text-decoration:none;">Lokesh Sain</a>
                </td>
                <td align="right" style="font-size:11px;color:#505872;font-family:monospace;">
                  ${esc(footerNote)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function infoRow(label, valueHtml, isLast = false) {
  const border = isLast ? "none" : "1px solid #1E2638";
  return `
  <tr>
    <td style="padding:10px 0 3px 0;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#38BDF8;font-family:monospace;">${esc(label)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:2px 0 10px 0;border-bottom:${border};font-size:14px;font-family:monospace;color:#F0F2F5;word-break:break-word;line-height:1.6;">${valueHtml}</td>
  </tr>`;
}

function infoBlock(title, rowsHtml) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#0F141D;border:1px solid #1E2638;border-radius:10px;margin-bottom:24px;">
    <tr>
      <td style="background-color:#141A24;padding:9px 16px;border-bottom:1px solid #1E2638;border-top-left-radius:9px;border-top-right-radius:9px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#38BDF8;font-family:monospace;">${esc(title)}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
      </td>
    </tr>
  </table>`;
}

function ctaButton(href, label) {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="border-radius:8px;background-color:#38BDF8;">
        <a href="${href}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:800;text-decoration:none;color:#05070A;font-family:-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:0.02em;">
          ${esc(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

/* ════════════════════════════════════════════════════════════════════════════
   1. CONFIRMATION EMAIL (Visitor Acknowledgement)
   ════════════════════════════════════════════════════════════════════════════ */
exports.confirmationEmail = (name) => {
  const safeName = esc(name);
  const html = baseLayout({
    headerSubtitle: "Software Engineer · Full Stack & Systems",
    title: "Message Received",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#F0F2F5;margin:0 0 10px;letter-spacing:-0.03em;">Message Received</h1>
    <p style="font-size:15px;color:#8B93A7;margin:0 0 20px;line-height:1.7;">
      Hi <strong style="color:#F0F2F5;">${safeName}</strong>, thanks for reaching out, Lokesh will get back to you soon.
    </p>
    <p style="font-size:14px;color:#CBD5E1;margin:0 0 24px;line-height:1.75;">
      I have received your message and will review it carefully. You can expect a response within <strong style="color:#38BDF8;">24–48 hours</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:#0F141D;border-radius:10px;border:1px solid #1E2638;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-left:3px solid #38BDF8;">
          <p style="font-size:11px;font-weight:700;color:#38BDF8;margin:0 0 8px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">What Happens Next?</p>
          <p style="font-size:13px;color:#CBD5E1;line-height:1.7;margin:0;">
            • Message securely recorded in the admin portal<br/>
            • Detailed review of project context or questions<br/>
            • Direct reply delivered to your inbox
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton(SITE_URL, "Explore Portfolio")}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #1E2638;margin-top:32px;">
      <tr><td style="padding-top:20px;">
        <p style="font-size:12px;color:#8B93A7;margin:0 0 4px;">Best regards,</p>
        <p style="font-size:15px;font-weight:800;color:#F0F2F5;margin:0 0 2px;">Lokesh Sain</p>
        <p style="font-size:12px;color:#38BDF8;margin:0;font-family:monospace;">Software Engineer</p>
      </td></tr>
    </table>`,
    footerNote: "Automated Confirmation",
  });

  const text = `Hi ${name},

Thanks for reaching out, Lokesh will get back to you soon.

I have received your message and will review it carefully. You can expect a response within 24–48 hours.

What Happens Next:
- Message securely recorded in portfolio system
- Direct review of project context or questions
- Direct reply delivered to your email inbox

Explore portfolio: ${SITE_URL}

Best regards,
Lokesh Sain
Software Engineer
${SITE_URL}`;

  return createTemplate(html, text);
};

/* ════════════════════════════════════════════════════════════════════════════
   2. ADMIN NOTIFICATION EMAIL (New Contact Form Submission)
   ════════════════════════════════════════════════════════════════════════════ */
exports.notificationEmail = ({
  name,
  email,
  message,
  ip,
  browser,
  device,
  dateStr,
}) => {
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeDate = esc(dateStr || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const safeIp = esc(normaliseIp(ip));
  const safeDevice = esc(device || "Unknown");
  const safeBrowser = esc(browser || "Unknown");

  const html = baseLayout({
    headerSubtitle: "Portfolio Contact Notification",
    title: "New Portfolio Contact",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#38BDF8;margin:0 0 16px;letter-spacing:-0.03em;">New Portfolio Contact</h1>

    ${infoBlock(
      "Sender Details",
      infoRow("Name", `<strong style="color:#F0F2F5;">${safeName}</strong>`) +
      infoRow("Email", `<a href="mailto:${safeEmail}" style="color:#38BDF8;font-weight:bold;">${safeEmail}</a>`) +
      infoRow("Timestamp", `<span style="color:#CBD5E1;">${safeDate}</span>`, true)
    )}

    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#38BDF8;font-family:monospace;margin:0 0 8px;">Message</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:#0F141D;border:1px solid #1E2638;border-radius:10px;padding:16px;font-size:14px;color:#F0F2F5;line-height:1.7;white-space:pre-wrap;word-break:break-word;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">${esc(message)}</td>
      </tr>
    </table>

    ${ctaButton(`mailto:${safeEmail}?subject=Re: Your message to Lokesh Sain`, `Reply to ${safeName}`)}

    <div style="margin-top:28px;">
    ${infoBlock(
      "Technical Details",
      infoRow("IP Address", `<span style="color:#CBD5E1;">${safeIp}</span>`) +
      infoRow("Device", `<span style="color:#CBD5E1;">${safeDevice}</span>`) +
      infoRow("Browser", `<span style="color:#CBD5E1;">${safeBrowser}</span>`, true)
    )}
    </div>`,
    footerNote: "Portfolio Admin Notification",
  });

  const text = `New Portfolio Contact — Lokesh Sain

Sender Details:
Name: ${name}
Email: ${email}
Time: ${dateStr || new Date().toISOString()}

Message:
${message}

Technical Details:
IP: ${normaliseIp(ip)}
Device: ${device || "Unknown"}
Browser: ${browser || "Unknown"}

Reply directly by emailing: ${email}`;

  return createTemplate(html, text);
};

/* ════════════════════════════════════════════════════════════════════════════
   3. LOGIN ALERT EMAIL
   ════════════════════════════════════════════════════════════════════════════ */
exports.loginAlertEmail = ({ ip, browser, device, dateStr }) => {
  const safeDate = esc(dateStr || new Date().toLocaleString());
  const safeIp = esc(normaliseIp(ip));
  const safeDevice = esc(device || "Unknown");
  const safeBrowser = esc(browser || "Unknown");

  const html = baseLayout({
    headerSubtitle: "Security Alert · Admin Access",
    title: "Admin Login Detected",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#38BDF8;margin:0 0 12px;letter-spacing:-0.03em;">Admin Login Detected</h1>
    <p style="font-size:14px;line-height:1.7;color:#CBD5E1;margin:0 0 20px;">
      A successful authenticated session was established on your portfolio admin dashboard.
    </p>

    ${infoBlock(
      "Session Details",
      infoRow("Timestamp", `<span style="color:#CBD5E1;">${safeDate}</span>`) +
      infoRow("IP Address", `<span style="color:#CBD5E1;">${safeIp}</span>`) +
      infoRow("Device", `<span style="color:#CBD5E1;">${safeDevice}</span>`) +
      infoRow("Browser", `<span style="color:#CBD5E1;">${safeBrowser}</span>`, true)
    )}

    ${ctaButton(`${SITE_URL}/admin`, "Open Admin Console")}`,
    footerNote: "Security Notification",
  });

  const text = `Admin Login Detected — Lokesh Sain

A successful authenticated session was established on your portfolio admin dashboard.

Session Details:
Timestamp: ${dateStr || new Date().toISOString()}
IP Address: ${normaliseIp(ip)}
Device: ${device || "Unknown"}
Browser: ${browser || "Unknown"}

Admin Dashboard: ${SITE_URL}/admin`;

  return createTemplate(html, text);
};

/* ════════════════════════════════════════════════════════════════════════════
   4. LOGOUT ALERT EMAIL
   ════════════════════════════════════════════════════════════════════════════ */
exports.logoutAlertEmail = ({ ip, browser, device, dateStr }) => {
  const safeDate = esc(dateStr || new Date().toLocaleString());
  const safeIp = esc(normaliseIp(ip));
  const safeDevice = esc(device || "Unknown");
  const safeBrowser = esc(browser || "Unknown");

  const html = baseLayout({
    headerSubtitle: "Security Alert · Admin Session Terminated",
    title: "Admin Logout",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#F0F2F5;margin:0 0 12px;letter-spacing:-0.03em;">Admin Logout</h1>
    <p style="font-size:14px;line-height:1.7;color:#CBD5E1;margin:0 0 20px;">
      Your admin session was ended. JWT session token has been invalidated.
    </p>

    ${infoBlock(
      "Session Details",
      infoRow("Timestamp", `<span style="color:#CBD5E1;">${safeDate}</span>`) +
      infoRow("IP Address", `<span style="color:#CBD5E1;">${safeIp}</span>`) +
      infoRow("Device", `<span style="color:#CBD5E1;">${safeDevice}</span>`) +
      infoRow("Browser", `<span style="color:#CBD5E1;">${safeBrowser}</span>`, true)
    )}`,
    footerNote: "Security Notification",
  });

  const text = `Admin Logout — Lokesh Sain

Your admin session was ended. JWT session token has been invalidated.

Session Details:
Timestamp: ${dateStr || new Date().toISOString()}
IP Address: ${normaliseIp(ip)}
Device: ${device || "Unknown"}
Browser: ${browser || "Unknown"}`;

  return createTemplate(html, text);
};

/* ════════════════════════════════════════════════════════════════════════════
   5. TWO-FACTOR AUTHENTICATION EMAIL
   ════════════════════════════════════════════════════════════════════════════ */
exports.twoFactorEmail = (code) => {
  const safeCode = esc(code);

  const html = baseLayout({
    headerSubtitle: "Security Verification · Two-Factor Code",
    title: "Verification Code",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#38BDF8;margin:0 0 10px;letter-spacing:-0.03em;">Verification Code</h1>
    <p style="font-size:14px;line-height:1.7;color:#CBD5E1;margin:0 0 24px;">
      Enter this code to complete admin authentication:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background-color:#0F141D;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:26px 20px;">
          <div style="font-size:38px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#38BDF8;line-height:1;">${safeCode}</div>
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:#8B93A7;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#F0F2F5;">10 minutes</strong> · Do not share this code with anyone
    </p>`,
    footerNote: "Admin Two-Factor Auth",
  });

  const text = `Admin Verification Code — Lokesh Sain

Your one-time authentication code is:
${code}

Expires in 10 minutes.
Do not share this code with anyone.`;

  return createTemplate(html, text);
};

/* ════════════════════════════════════════════════════════════════════════════
   6. PASSWORD RESET OTP EMAIL
   ════════════════════════════════════════════════════════════════════════════ */
exports.resetPasswordEmail = (code) => {
  const safeCode = esc(code);

  const html = baseLayout({
    headerSubtitle: "Account Security · Password Recovery",
    title: "Reset Your Password",
    bodyHtml: `
    <h1 style="font-size:22px;font-weight:800;color:#38BDF8;margin:0 0 10px;letter-spacing:-0.03em;">Reset Your Password</h1>
    <p style="font-size:14px;line-height:1.7;color:#CBD5E1;margin:0 0 24px;">
      A password reset was requested for your portfolio admin account:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background-color:#0F141D;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:26px 20px;">
          <div style="font-size:38px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#38BDF8;line-height:1;">${safeCode}</div>
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:#8B93A7;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#F0F2F5;">10 minutes</strong> · If you did not request this, please ignore this email
    </p>`,
    footerNote: "Admin Password Recovery",
  });

  const text = `Password Reset Request — Lokesh Sain

Password reset code requested for your admin account:
${code}

Expires in 10 minutes.
If you did not request this reset, you can safely ignore this email.`;

  return createTemplate(html, text);
};
