/**
 * Email Templates — v15 Production
 *
 * Changes from v14:
 *  - confirmationEmail: removed green avatar circle; added real branded
 *    social icon circles (LinkedIn #0A66C2, GitHub #24292e, Portfolio
 *    using the actual favicon.svg as a base64 <img> on yellow bg)
 *  - Added resetPasswordEmail for the forgot-password OTP flow
 *  - IP normalisation retained
 *  - Location field remains removed
 */

/* ─── IP normalisation ──────────────────────────────────────────────────── */
function normaliseIp(ip) {
  if (!ip || ip === "—") return "Unknown";
  if (ip === "::1" || ip === "127.0.0.1") return "127.0.0.1 (localhost)";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

/* ─── HTML escape ───────────────────────────────────────────────────────── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─── Portfolio branding icon (CDN) for email ────────────────────────────── */
const FAVICON_IMG = `<img src="https://raw.githubusercontent.com/thelokeshsain/Weather-App/refs/heads/main/public/icon-512.png" width="22" height="21" alt="LS" style="display:block;border:0;" />`;

/* ─── Brand-colored icons (CDN) ─────────────────────────────────────────── */
const ICONS = {
  github: `<img src="https://cdn.simpleicons.org/github/white" width="18" height="18" alt="GitHub" style="display:block;border:0;" />`,
  linkedin: `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" width="18" height="18" alt="LinkedIn" style="display:block;border:0;" />`,
  mail: `<img src="https://cdn.simpleicons.org/gmail" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  user: `<img src="https://img.icons8.com/ios-glyphs/30/888888/user.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  clock: `<img src="https://img.icons8.com/ios-glyphs/30/888888/clock.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  wifi: `<img src="https://img.icons8.com/ios-glyphs/30/888888/wifi.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  monitor: `<img src="https://img.icons8.com/ios-glyphs/30/888888/monitor.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  cpu: `<img src="https://img.icons8.com/ios-glyphs/30/888888/processor.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:middle;border:0;" />`,
  check: `<img src="https://img.icons8.com/material-rounded/60/000000/checkmark.png" width="16" height="16" alt="✓" style="display:block;border:0;" />`,
  shield: `<img src="https://img.icons8.com/ios-glyphs/60/ffde2d/security-shield.png" width="22" height="22" alt="🛡️" style="display:block;border:0;" />`,
  lock: `<img src="https://img.icons8.com/ios-glyphs/60/ffde2d/lock.png" width="22" height="22" alt="🔒" style="display:block;border:0;" />`,
  logout: `<img src="https://img.icons8.com/ios-glyphs/60/000000/exit.png" width="22" height="22" alt="🚪" style="display:block;border:0;" />`,
  msg: `<img src="https://img.icons8.com/ios-glyphs/60/ffde2d/chat.png" width="22" height="22" alt="💬" style="display:block;border:0;" />`,
  key: `<img src="https://img.icons8.com/ios-glyphs/60/ffde2d/key.png" width="22" height="22" alt="🔑" style="display:block;border:0;" />`,
};

/* ─── Base email wrapper ─────────────────────────────────────────────────── */
function base({ headerBg, headerContent, bodyContent, footerNote }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Lokesh Sain</title>
<style type="text/css">
  body,table,td,p,a,h1,h2{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block;}
  a{color:inherit;}
  @media only screen and (max-width:600px){
    .email-card{width:100%!important;border-radius:0!important;border-left:0!important;border-right:0!important;}
    .pad{padding:20px 16px!important;}
    .pad-hd{padding:22px 16px!important;}
    .pad-ft{padding:14px 16px!important;}
    .hd-title{font-size:18px!important;}
    .code-box{font-size:36px!important;letter-spacing:0.25em!important;}
    .btn-main{padding:13px 20px!important;font-size:14px!important;}
    .social-cell{display:block!important;padding:0 0 10px 0!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f0ebe0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
       style="background-color:#f0ebe0;padding:32px 12px;">
<tr><td align="center" valign="top">
  <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="max-width:560px;background:#ffffff;border:2px solid #000000;border-radius:16px;overflow:hidden;">
    <tr>
      <td class="pad-hd" style="background:${headerBg};padding:28px 32px;border-bottom:2px solid #000000;">
        ${headerContent}
      </td>
    </tr>
    <tr>
      <td style="background:#f5f0e8;border-bottom:2px solid #000000;padding:10px 16px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="width:12px;height:12px;background:#ff5f57;border-radius:50%;"></td>
          <td width="7"></td>
          <td style="width:12px;height:12px;background:#febc2e;border-radius:50%;"></td>
          <td width="7"></td>
          <td style="width:12px;height:12px;background:#28c840;border-radius:50%;"></td>
          <td width="12"></td>
          <td style="font-family:monospace;font-size:11px;color:#888888;vertical-align:middle;">lokeshsain.vercel.app</td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td class="pad" style="padding:28px 32px;background:#ffffff;">
        ${bodyContent}
      </td>
    </tr>
    <tr>
      <td class="pad-ft" style="background:#f5f0e8;border-top:2px solid #000000;padding:16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:11px;color:#888888;font-family:monospace;">&#169; ${year} Lokesh Sain</td>
          <td align="right" style="font-size:11px;color:#888888;font-family:monospace;">${footerNote || "Automated message."}</td>
        </tr></table>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─── Info row ───────────────────────────────────────────────────────────── */
function infoRow(icon, label, value, isLast = false) {
  const border = isLast ? "none" : "1px solid #e8e0d0";
  return `
  <tr>
    <td style="padding:10px 0 4px 0;border-bottom:none;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:20px;vertical-align:middle;color:#888888;padding-right:6px;">${icon}</td>
        <td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888888;font-family:monospace;vertical-align:middle;">${esc(label)}</td>
      </tr></table>
    </td>
  </tr>
  <tr>
    <td style="padding:2px 0 10px 0;border-bottom:${border};font-size:14px;color:#111111;font-family:monospace;word-break:break-word;overflow-wrap:anywhere;line-height:1.5;">${value}</td>
  </tr>`;
}

/* ─── Info block ─────────────────────────────────────────────────────────── */
function infoBlock(title, headerBg, headerColor, rows) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="border:2px solid #000000;border-radius:12px;overflow:hidden;margin-bottom:20px;border-collapse:separate;">
    <tr>
      <td style="background:${headerBg};padding:9px 16px;border-bottom:2px solid #000000;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${headerColor};font-family:monospace;">${title}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

/* ─── CTA Button ─────────────────────────────────────────────────────────── */
function ctaBtn(href, label, bg = "#000000", color = "#ffffff") {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="border-radius:12px;background:${bg};border:2px solid #000000;">
        <a class="btn-main" href="${href}"
           style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;color:${color};font-family:Arial,sans-serif;border-radius:10px;letter-spacing:-0.01em;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/* ─── Social icon circle ─────────────────────────────────────────────────── */
function socialCircle(href, bg, icon, alt) {
  return `
  <td class="social-cell" style="padding-right:10px;">
    <a href="${href}" style="display:inline-block;width:44px;height:44px;border-radius:50%;background:${bg};border:2px solid #000000;text-decoration:none;">
      <table width="44" height="44" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" valign="middle">${icon}</td></tr>
      </table>
    </a>
  </td>`;
}

/* ════════════════════════════════════════════════════════════════════════════
   1. CONFIRMATION EMAIL — to the person who submitted the contact form
 ════════════════════════════════════════════════════════════════════════════ */
exports.confirmationEmail = (name) =>
  base({
    headerBg: "#ffde2d",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;letter-spacing:-0.04em;color:#000000;">Lokesh Sain</div>
        <div style="font-size:12px;color:#333333;margin-top:4px;font-family:monospace;">Software Engineer &middot; Jaipur, India</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">
        ${ICONS.check}
      </td>
    </tr></table>`,
    bodyContent: `
    <h1 style="font-size:26px;font-weight:900;color:#000000;margin:0 0 6px;letter-spacing:-0.04em;">Thank You!</h1>
    <p style="font-size:15px;color:#555555;margin:0 0 28px;line-height:1.7;">
      You have received a new message from your portfolio
    </p>

    <p style="font-size:19px;font-weight:900;color:#000000;margin:0 0 8px;letter-spacing:-0.03em;">Hi ${esc(name)}!</p>
    <p style="font-size:15px;color:#444444;margin:0 0 28px;line-height:1.75;">
      Thank you for reaching out! I&rsquo;ve received your message and will get back to you as soon as possible.
    </p>

    <!-- What happens next -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#f5f0e8;border-radius:12px;border:2px solid #000000;margin-bottom:24px;overflow:hidden;">
      <tr>
        <td style="padding:16px 20px;border-left:4px solid #ffde2d;">
          <p style="font-size:13px;font-weight:700;color:#000000;margin:0 0 12px;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;">What happens next?</p>
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-size:14px;color:#333333;line-height:2;">
              &bull;&nbsp; I&rsquo;ll review your message carefully<br/>
              &bull;&nbsp; You&rsquo;ll hear back from me within 24&ndash;48 hours<br/>
              &bull;&nbsp; Feel free to check out my work in the meantime
            </td>
          </tr></table>
        </td>
      </tr>
    </table>

    <!-- Connect with me -->
    <p style="font-size:13px;color:#888888;text-align:center;margin:0 0 16px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">Connect with me</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
      <tr>
        ${socialCircle("https://linkedin.com/in/thelokeshsain", "#0A66C2", ICONS.linkedin, "LinkedIn")}
        ${socialCircle("https://github.com/thelokeshsain", "#24292e", ICONS.github, "GitHub")}
        <td class="social-cell" style="padding-right:0;">
          <a href="https://lokeshsain.vercel.app" style="display:inline-block;width:44px;height:44px;border-radius:50%;background:#ffde2d;border:2px solid #000000;text-decoration:none;">
            <table width="44" height="44" cellpadding="0" cellspacing="0" border="0">
              <tr><td align="center" valign="middle">${FAVICON_IMG}</td></tr>
            </table>
          </a>
        </td>
      </tr>
    </table>

    ${ctaBtn("https://lokeshsain.vercel.app/", "View My Portfolio &rarr;", "#000000", "#ffffff")}

    <!-- Signature -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid #000000;margin-top:28px;">
      <tr><td style="padding-top:20px;">
        <p style="font-size:14px;color:#555555;margin:0 0 4px;">Best Regards,</p>
        <p style="font-size:18px;font-weight:900;color:#000000;margin:0 0 3px;letter-spacing:-0.03em;">Lokesh Sain</p>
        <p style="font-size:12px;color:#888888;margin:0;font-family:monospace;">Software Engineer</p>
      </td></tr>
    </table>`,
    footerNote: "This is an automated response. Please do not reply.",
  });

/* ════════════════════════════════════════════════════════════════════════════
   2. ADMIN NOTIFICATION — contact form submission
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
    headerBg: "#000000",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;color:#ffde2d;letter-spacing:-0.03em;">New Contact Message</div>
        <div style="font-size:12px;color:#aaaaaa;margin-top:4px;font-family:monospace;">You have received a new message from your portfolio</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">${ICONS.msg}</td>
    </tr></table>`,
    bodyContent: `
    ${infoBlock(
      "Sender Details",
      "#ffde2d",
      "#000000",
      infoRow(ICONS.user, "Name", esc(name)) +
      infoRow(
        ICONS.mail,
        "Email",
        `<a href="mailto:${esc(email)}" style="color:#000000;font-weight:700;">${esc(email)}</a>`,
      ) +
      infoRow(
        ICONS.clock,
        "Time",
        esc(
          dateStr ||
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        ),
        true,
      ),
    )}
    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888888;font-family:monospace;margin:0 0 8px;">Message</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#f5f0e8;border:2px solid #000000;border-radius:10px;padding:16px;font-size:14px;color:#111111;line-height:1.75;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;">
          ${esc(message)}
        </td>
      </tr>
    </table>
    ${ctaBtn(`mailto:${esc(email)}?subject=Re: Your message&body=Hi ${esc(name)},`, `Reply to ${esc(name)} &rarr;`, "#ffde2d", "#000000")}
    <div style="margin-top:24px;">
    ${infoBlock(
      "Submission Details",
      "#f5f0e8",
      "#555555",
      infoRow(ICONS.wifi, "IP Address", esc(normaliseIp(ip))) +
      infoRow(ICONS.monitor, "Device", esc(device || "Unknown")) +
      infoRow(ICONS.cpu, "Browser", esc(browser || "Unknown"), true),
    )}
    </div>`,
    footerNote: "Sent from your portfolio contact form",
  });

/* ════════════════════════════════════════════════════════════════════════════
   3. LOGIN ALERT
 ════════════════════════════════════════════════════════════════════════════ */
exports.loginAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerBg: "#000000",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;color:#ffde2d;letter-spacing:-0.03em;">Admin Login Detected</div>
        <div style="font-size:12px;color:#aaaaaa;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">${ICONS.lock}</td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.75;color:#333333;margin:0 0 24px;">
      A successful login was recorded on your portfolio admin account.
      If this was you, no action is needed.<br/><br/>
      <strong style="color:#000000;">If this wasn&rsquo;t you &mdash; change your password immediately.</strong>
    </p>
    ${infoBlock(
      "Login Details",
      "#ffde2d",
      "#000000",
      infoRow(ICONS.clock, "Time", esc(dateStr || "Unknown")) +
      infoRow(ICONS.wifi, "IP Address", esc(normaliseIp(ip))) +
      infoRow(ICONS.monitor, "Device", esc(device || "Unknown")) +
      infoRow(ICONS.cpu, "Browser", esc(browser || "Unknown"), true),
    )}
    ${ctaBtn((process.env.CLIENT_URL || "http://localhost:5173") + "/admin", "Go to Admin Panel &rarr;", "#ffde2d", "#000000")}`,
    footerNote: "Lokesh Portfolio Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   4. LOGOUT ALERT
 ════════════════════════════════════════════════════════════════════════════ */
exports.logoutAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerBg: "#f5f0e8",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;color:#000000;letter-spacing:-0.03em;">Admin Logout</div>
        <div style="font-size:12px;color:#555555;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">${ICONS.logout}</td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.75;color:#333333;margin:0 0 24px;">
      Your admin session was ended. Your JWT token has been invalidated.
    </p>
    ${infoBlock(
      "Session Details",
      "#f5f0e8",
      "#555555",
      infoRow(ICONS.clock, "Time", esc(dateStr || "Unknown")) +
      infoRow(ICONS.wifi, "IP Address", esc(normaliseIp(ip))) +
      infoRow(ICONS.monitor, "Device", esc(device || "Unknown")) +
      infoRow(ICONS.cpu, "Browser", esc(browser || "Unknown"), true),
    )}`,
    footerNote: "Lokesh Portfolio Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   5. 2FA CODE EMAIL
 ════════════════════════════════════════════════════════════════════════════ */
exports.twoFactorEmail = (code) =>
  base({
    headerBg: "#000000",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;color:#ffde2d;letter-spacing:-0.03em;">Verification Code</div>
        <div style="font-size:12px;color:#aaaaaa;margin-top:4px;font-family:monospace;">Two-Factor Authentication</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">${ICONS.shield}</td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.8;color:#333333;margin:0 0 24px;">Enter this code to complete your admin login:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background:#ffde2d;border:2px solid #000000;border-radius:14px;padding:28px 20px;">
          <div class="code-box" style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#000000;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#888888;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#000000;">10 minutes</strong> &nbsp;&bull;&nbsp; Never share this code
    </p>`,
    footerNote: "Lokesh Portfolio Admin Security",
  });

/* ════════════════════════════════════════════════════════════════════════════
   6. PASSWORD RESET OTP EMAIL — forgot password flow
 ════════════════════════════════════════════════════════════════════════════ */
exports.resetPasswordEmail = (code) =>
  base({
    headerBg: "#000000",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div class="hd-title" style="font-size:22px;font-weight:900;color:#ffde2d;letter-spacing:-0.03em;">Reset Your Password</div>
        <div style="font-size:12px;color:#aaaaaa;margin-top:4px;font-family:monospace;">Admin Password Recovery</div>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">${ICONS.key}</td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.8;color:#333333;margin:0 0 8px;">
      You requested a password reset for your admin account.
    </p>
    <p style="font-size:14px;line-height:1.7;color:#666666;margin:0 0 24px;">
      Enter this code on the reset page. It expires in <strong style="color:#000000;">10 minutes</strong>.
      If you didn&rsquo;t request this, you can safely ignore this email.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background:#ffde2d;border:2px solid #000000;border-radius:14px;padding:28px 20px;">
          <div class="code-box" style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#000000;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#fff3cd;border:2px solid #000000;border-radius:10px;margin-bottom:20px;overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;border-left:4px solid #ffde2d;">
          <p style="font-size:13px;color:#333333;margin:0;line-height:1.7;">
            <strong>Security reminder:</strong> Lokesh Portfolio will never ask for your password via email.
            This code only grants access to the reset form.
          </p>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#888888;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#000000;">10 minutes</strong> &nbsp;&bull;&nbsp; Do not share this code
    </p>`,
    footerNote: "Lokesh Portfolio Security",
  });
