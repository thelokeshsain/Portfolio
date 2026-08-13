/**
 * Email Templates — Adaptive Device Theme (Automatic Light & Dark Mode)
 * Matches Portfolio Design System (Studio Light & Obsidian Black 3D Spatial themes)
 */

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
    .replace(/"/g, "&quot;");
}

/* ─── 3D LS Monogram Brand Icon ────────────────────────────── */
const LS_BRAND_ICON = `<table width="38" height="38" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;background:linear-gradient(135deg, #1f2128 0%, #111216 100%);border:1px solid #ff6b00;">
  <tr>
    <td align="center" valign="middle" style="font-family:'Outfit',Arial,sans-serif;font-size:15px;font-weight:900;color:#ff8800;letter-spacing:-1px;">LS</td>
  </tr>
</table>`;

/* ─── Base email wrapper — Adaptive Device Theme ──────────────────────────────── */
function base({ headerContent, bodyContent, footerNote }) {
  const year = new Date().getFullYear();
  const siteUrl = process.env.CLIENT_URL || "https://lokeshsain.vercel.app";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<title>Lokesh Sain</title>
<style type="text/css">
  body,table,td,p,a,h1,h2{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block;}
  a{color:inherit;}
  
  /* Adaptive Light & Dark Device Theme Overrides */
  @media (prefers-color-scheme: dark) {
    .bg-canvas { background-color: #08080a !important; }
    .card-container { background-color: #111216 !important; border: 1px solid rgba(255,107,0,0.3) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important; }
    .header-bar { background-color: #161820 !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
    .block-container { background-color: #181a22 !important; border: 1px solid rgba(255,107,0,0.25) !important; }
    .block-header { background-color: #1f222e !important; }
    .text-title { color: #ffffff !important; }
    .text-body { color: #d1d5e3 !important; }
    .text-muted { color: #858899 !important; }
    .footer-bg { background-color: #090a0d !important; border-top: 1px solid rgba(255,255,255,0.08) !important; }
  }

  @media (prefers-color-scheme: light) {
    .bg-canvas { background-color: #f4f4f7 !important; }
    .card-container { background-color: #ffffff !important; border: 1px solid rgba(0,0,0,0.12) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.06) !important; }
    .header-bar { background-color: #f1f2f5 !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; }
    .block-container { background-color: #f8f9fa !important; border: 1px solid rgba(0,0,0,0.1) !important; }
    .block-header { background-color: #f1f3f5 !important; }
    .text-title { color: #0a0a0d !important; }
    .text-body { color: #24252c !important; }
    .text-muted { color: #6e6f7a !important; }
    .footer-bg { background-color: #f1f3f5 !important; border-top: 1px solid rgba(0,0,0,0.08) !important; }
  }

  @media only screen and (max-width:600px){
    .email-card{width:100%!important;border-radius:0!important;border:none!important;}
    .pad{padding:24px 18px!important;}
    .pad-hd{padding:24px 18px!important;}
    .pad-ft{padding:16px 18px!important;}
  }
</style>
</head>
<body class="bg-canvas" style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table class="bg-canvas" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f4f4f7;padding:32px 12px;">
<tr><td align="center" valign="top">
  <table class="email-card card-container" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="max-width:560px;background:#ffffff;border:1px solid rgba(0,0,0,0.12);border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
    <!-- Top 3D Accent Line -->
    <tr><td style="height:3px;background:linear-gradient(90deg, #ff5500 0%, #ff8800 50%, #ffaa00 100%);"></td></tr>
    
    <!-- Mac Terminal Bar Header -->
    <tr>
      <td class="header-bar" style="background:#f1f2f5;padding:12px 24px;border-bottom:1px solid rgba(0,0,0,0.08);">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:1px;line-height:1px;vertical-align:middle;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff5f57;margin-right:6px;vertical-align:middle;"></span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#febc2e;margin-right:6px;vertical-align:middle;"></span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#28c840;margin-right:12px;vertical-align:middle;"></span>
            <span class="text-muted" style="font-family:monospace;font-size:12px;color:#6e6f7a;vertical-align:middle;line-height:1;">lokesh@dev — portfolio</span>
          </td>
          <td align="right">${LS_BRAND_ICON}</td>
        </tr></table>
      </td>
    </tr>

    <!-- Main Header -->
    <tr>
      <td class="pad-hd" style="padding:28px 32px;border-bottom:1px solid rgba(255,107,0,0.15);">
        ${headerContent}
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td class="pad text-body" style="padding:32px;color:#24252c;">
        ${bodyContent}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td class="pad-ft footer-bg" style="background:#f1f3f5;border-top:1px solid rgba(0,0,0,0.08);padding:20px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td class="text-muted" style="font-size:12px;color:#6e6f7a;font-family:monospace;">&#169; ${year} <a href="${siteUrl}" style="color:#ff6b00;text-decoration:none;font-weight:bold;">Lokesh Sain</a></td>
          <td class="text-muted" align="right" style="font-size:11px;color:#6e6f7a;font-family:monospace;">${footerNote || "Automated Message"}</td>
        </tr></table>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function infoRow(label, value, isLast = false) {
  const border = isLast ? "none" : "1px solid rgba(0,0,0,0.08)";
  return `
  <tr>
    <td style="padding:10px 0 4px 0;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff6b00;font-family:monospace;">${esc(label)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:2px 0 10px 0;border-bottom:${border};font-size:14px;font-family:monospace;word-break:break-word;line-height:1.6;">${value}</td>
  </tr>`;
}

function infoBlock(title, rows) {
  return `
  <table class="block-container" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#f8f9fa;border:1px solid rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;margin-bottom:24px;">
    <tr>
      <td class="block-header" style="background:#f1f3f5;padding:10px 18px;border-bottom:1px solid rgba(0,0,0,0.08);">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff6b00;font-family:monospace;">${title}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

function ctaBtn(href, label, bg = "linear-gradient(135deg, #ff6b00 0%, #ff8800 100%)", color = "#ffffff") {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="border-radius:10px;background:${bg};box-shadow:0 4px 16px rgba(255,107,0,0.3);">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:800;text-decoration:none;color:${color};font-family:-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:0.02em;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/* ════════════════════════════════════════════════════════════════════════════
   1. CONFIRMATION EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.confirmationEmail = (name) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="text-title" style="font-size:22px;font-weight:900;letter-spacing:-0.03em;color:#0a0a0d;">Lokesh Sain</div>
        <div style="font-size:13px;color:#ff6b00;margin-top:4px;font-family:monospace;font-weight:600;">Software Engineer &middot; React & MERN Stack</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <h1 class="text-title" style="font-size:26px;font-weight:900;color:#0a0a0d;margin:0 0 8px;letter-spacing:-0.03em;">Message Received!</h1>
    <p class="text-muted" style="font-size:15px;color:#6e6f7a;margin:0 0 24px;line-height:1.7;">
      Hi <strong class="text-title" style="color:#0a0a0d;">${esc(name)}</strong>, thank you for reaching out!
    </p>
    <p class="text-body" style="font-size:15px;color:#24252c;margin:0 0 28px;line-height:1.75;">
      I have received your message and will review it carefully. You can expect a response within <strong style="color:#ff6b00;">24–48 hours</strong>.
    </p>

    <table class="block-container" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#f8f9fa;border-radius:12px;border:1px solid rgba(0,0,0,0.1);margin-bottom:28px;">
      <tr>
        <td style="padding:18px 20px;border-left:4px solid #ff6b00;">
          <p style="font-size:12px;font-weight:700;color:#ff6b00;margin:0 0 10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">What Happens Next?</p>
          <p class="text-body" style="font-size:14px;color:#24252c;line-height:1.8;margin:0;">
            &bull; Message stored in admin portal<br/>
            &bull; Reviewing project details & inquiries<br/>
            &bull; Direct reply sent to your email inbox
          </p>
        </td>
      </tr>
    </table>

    ${ctaBtn(process.env.CLIENT_URL || "https://lokeshsain.vercel.app", "Explore Portfolio &rarr;")}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(0,0,0,0.08);margin-top:32px;">
      <tr><td style="padding-top:20px;">
        <p class="text-muted" style="font-size:13px;color:#6e6f7a;margin:0 0 4px;">Best regards,</p>
        <p class="text-title" style="font-size:17px;font-weight:900;color:#0a0a0d;margin:0 0 2px;">Lokesh Sain</p>
        <p style="font-size:12px;color:#ff6b00;margin:0;font-family:monospace;">Software Engineer</p>
      </td></tr>
    </table>`,
    footerNote: "Automated confirmation response",
  });

/* ════════════════════════════════════════════════════════════════════════════
   2. ADMIN NOTIFICATION EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.notificationEmail = ({
  name,
  email,
  message,
  ip,
  browser,
  device,
  dateStr,
}) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff6b00;letter-spacing:-0.03em;">⚡ New Contact Submission</div>
        <div class="text-muted" style="font-size:12px;color:#6e6f7a;margin-top:4px;font-family:monospace;">Portfolio Contact Form</div>
      </td>
    </tr></table>`,
    bodyContent: `
    ${infoBlock(
      "Sender Details",
      infoRow("Name", `<span class="text-title" style="color:#0a0a0d;font-weight:bold;">${esc(name)}</span>`) +
      infoRow("Email", `<a href="mailto:${esc(email)}" style="color:#ff6b00;font-weight:bold;text-decoration:none;">${esc(email)}</a>`) +
      infoRow("Time", `<span class="text-body" style="color:#24252c;">${esc(dateStr || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</span>`, true)
    )}

    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff6b00;font-family:monospace;margin:0 0 8px;">Message</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td class="block-container text-body" style="background:#f8f9fa;border:1px solid rgba(0,0,0,0.1);border-radius:12px;padding:18px;font-size:14px;color:#24252c;line-height:1.75;white-space:pre-wrap;word-break:break-word;">
          ${esc(message)}
        </td>
      </tr>
    </table>

    ${ctaBtn(`mailto:${esc(email)}?subject=Re: Your message&body=Hi ${esc(name)},`, `Reply to ${esc(name)} &rarr;`)}

    <div style="margin-top:28px;">
    ${infoBlock(
      "Technical Details",
      infoRow("IP Address", `<span class="text-body" style="color:#24252c;">${esc(normaliseIp(ip))}</span>`) +
      infoRow("Device", `<span class="text-body" style="color:#24252c;">${esc(device || "Unknown")}</span>`) +
      infoRow("Browser", `<span class="text-body" style="color:#24252c;">${esc(browser || "Unknown")}</span>`, true)
    )}
    </div>`,
    footerNote: "Portfolio Admin Notification",
  });

/* ════════════════════════════════════════════════════════════════════════════
   3. LOGIN ALERT EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.loginAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff6b00;letter-spacing:-0.03em;">🔐 Admin Login Detected</div>
        <div class="text-muted" style="font-size:12px;color:#6e6f7a;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p class="text-body" style="font-size:15px;line-height:1.75;color:#24252c;margin:0 0 24px;">
      A successful login was recorded on your portfolio admin dashboard.
    </p>
    ${infoBlock(
      "Session Details",
      infoRow("Time", `<span class="text-body" style="color:#24252c;">${esc(dateStr || "Unknown")}</span>`) +
      infoRow("IP Address", `<span class="text-body" style="color:#24252c;">${esc(normaliseIp(ip))}</span>`) +
      infoRow("Device", `<span class="text-body" style="color:#24252c;">${esc(device || "Unknown")}</span>`) +
      infoRow("Browser", `<span class="text-body" style="color:#24252c;">${esc(browser || "Unknown")}</span>`, true)
    )}
    ${ctaBtn((process.env.CLIENT_URL || "https://lokeshsain.vercel.app") + "/admin", "Go to Admin Dashboard &rarr;")}`,
    footerNote: "Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   4. LOGOUT ALERT EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.logoutAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="text-title" style="font-size:22px;font-weight:900;color:#0a0a0d;letter-spacing:-0.03em;">🚪 Admin Logout</div>
        <div class="text-muted" style="font-size:12px;color:#6e6f7a;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p class="text-body" style="font-size:15px;line-height:1.75;color:#24252c;margin:0 0 24px;">
      Your admin session was ended. JWT session token invalidated.
    </p>
    ${infoBlock(
      "Session Details",
      infoRow("Time", `<span class="text-body" style="color:#24252c;">${esc(dateStr || "Unknown")}</span>`) +
      infoRow("IP Address", `<span class="text-body" style="color:#24252c;">${esc(normaliseIp(ip))}</span>`) +
      infoRow("Device", `<span class="text-body" style="color:#24252c;">${esc(device || "Unknown")}</span>`) +
      infoRow("Browser", `<span class="text-body" style="color:#24252c;">${esc(browser || "Unknown")}</span>`, true)
    )}`,
    footerNote: "Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   5. 2FA CODE EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.twoFactorEmail = (code) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff6b00;letter-spacing:-0.03em;">🛡️ Verification Code</div>
        <div class="text-muted" style="font-size:12px;color:#6e6f7a;margin-top:4px;font-family:monospace;">Two-Factor Authentication</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p class="text-body" style="font-size:15px;line-height:1.8;color:#24252c;margin:0 0 24px;">Enter this code to complete admin login:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td class="block-container" align="center" style="background:#f8f9fa;border:1px solid #ff6b00;border-radius:14px;padding:28px 20px;">
          <div style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#ff6b00;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <p class="text-muted" style="font-size:13px;color:#6e6f7a;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong class="text-title" style="color:#0a0a0d;">10 minutes</strong> &bull; Do not share this code
    </p>`,
    footerNote: "Admin Security",
  });

/* ════════════════════════════════════════════════════════════════════════════
   6. PASSWORD RESET OTP EMAIL — Adaptive Device Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.resetPasswordEmail = (code) =>
  base({
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff6b00;letter-spacing:-0.03em;">🔑 Reset Your Password</div>
        <div class="text-muted" style="font-size:12px;color:#6e6f7a;margin-top:4px;font-family:monospace;">Admin Password Recovery</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p class="text-body" style="font-size:15px;line-height:1.8;color:#24252c;margin:0 0 24px;">
      Password reset code requested for admin account:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td class="block-container" align="center" style="background:#f8f9fa;border:1px solid #ff6b00;border-radius:14px;padding:28px 20px;">
          <div style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#ff6b00;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <p class="text-muted" style="font-size:13px;color:#6e6f7a;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong class="text-title" style="color:#0a0a0d;">10 minutes</strong> &bull; Do not share this code
    </p>`,
    footerNote: "Admin Password Recovery",
  });
