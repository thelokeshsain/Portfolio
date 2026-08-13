/**
 * Email Templates — Sleek 3D Spatial Obsidian Black & Electric Amber Orange Theme
 * Matches Portfolio Design System (Obsidian canvas, Electric Orange #ff6b00 accents, 3D card borders)
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
const LS_BRAND_ICON = `<table width="40" height="40" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;background:linear-gradient(135deg, #1f2128 0%, #111216 100%);border:1px solid #ff6b00;">
  <tr>
    <td align="center" valign="middle" style="font-family:'Outfit',Arial,sans-serif;font-size:16px;font-weight:900;color:#ff8800;letter-spacing:-1px;">LS</td>
  </tr>
</table>`;

/* ─── Base email wrapper — 3D Obsidian & Electric Orange ──────────────────────────────── */
function base({ headerBg = "#14151a", headerContent, bodyContent, footerNote }) {
  const year = new Date().getFullYear();
  const siteUrl = process.env.CLIENT_URL || "https://lokeshsain.vercel.app";

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
    .email-card{width:100%!important;border-radius:0!important;border:none!important;}
    .pad{padding:24px 18px!important;}
    .pad-hd{padding:24px 18px!important;}
    .pad-ft{padding:16px 18px!important;}
    .code-box{font-size:36px!important;letter-spacing:0.25em!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#08080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#08080a;padding:36px 12px;">
<tr><td align="center" valign="top">
  <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="max-width:560px;background:#111216;border:1px solid rgba(255,107,0,0.3);border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.8);">
    <!-- Top 3D Accent Line -->
    <tr><td style="height:3px;background:linear-gradient(90deg, #ff5500 0%, #ff8800 50%, #ffaa00 100%);"></td></tr>
    
    <!-- Mac Terminal Bar Header -->
    <tr>
      <td style="background:#161820;padding:12px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:1px;line-height:1px;vertical-align:middle;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff5f57;margin-right:6px;vertical-align:middle;"></span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#febc2e;margin-right:6px;vertical-align:middle;"></span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#28c840;margin-right:12px;vertical-align:middle;"></span>
            <span style="font-family:monospace;font-size:12px;color:#858899;vertical-align:middle;line-height:1;">lokesh@dev — portfolio</span>
          </td>
          <td align="right">${LS_BRAND_ICON}</td>
        </tr></table>
      </td>
    </tr>

    <!-- Main Header -->
    <tr>
      <td class="pad-hd" style="background:${headerBg};padding:28px 32px;border-bottom:1px solid rgba(255,107,0,0.2);">
        ${headerContent}
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td class="pad" style="padding:32px;background:#111216;color:#e1e4ed;">
        ${bodyContent}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td class="pad-ft" style="background:#090a0d;border-top:1px solid rgba(255,255,255,0.08);padding:20px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:12px;color:#7a7e8c;font-family:monospace;">&#169; ${year} <a href="${siteUrl}" style="color:#ff8800;text-decoration:none;font-weight:bold;">Lokesh Sain</a></td>
          <td align="right" style="font-size:11px;color:#606370;font-family:monospace;">${footerNote || "Automated Message"}</td>
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
  const border = isLast ? "none" : "1px solid rgba(255,255,255,0.08)";
  return `
  <tr>
    <td style="padding:10px 0 4px 0;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff8800;font-family:monospace;">${esc(label)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:2px 0 10px 0;border-bottom:${border};font-size:14px;color:#f0f2f8;font-family:monospace;word-break:break-word;line-height:1.6;">${value}</td>
  </tr>`;
}

function infoBlock(title, rows) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#181a22;border:1px solid rgba(255,107,0,0.25);border-radius:12px;overflow:hidden;margin-bottom:24px;">
    <tr>
      <td style="background:#1f222e;padding:10px 18px;border-bottom:1px solid rgba(255,107,0,0.2);">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff8800;font-family:monospace;">${title}</span>
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
   1. CONFIRMATION EMAIL — 3D Spatial Black & Electric Orange Theme
  ════════════════════════════════════════════════════════════════════════════ */
exports.confirmationEmail = (name) =>
  base({
    headerBg: "linear-gradient(135deg, #181a24 0%, #111218 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;letter-spacing:-0.03em;color:#ffffff;">Lokesh Sain</div>
        <div style="font-size:13px;color:#ff8800;margin-top:4px;font-family:monospace;font-weight:600;">Software Engineer &middot; React & MERN Stack</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <h1 style="font-size:26px;font-weight:900;color:#ffffff;margin:0 0 8px;letter-spacing:-0.03em;">Message Received!</h1>
    <p style="font-size:15px;color:#a0a5b5;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#ffffff;">${esc(name)}</strong>, thank you for reaching out!
    </p>
    <p style="font-size:15px;color:#d1d5e3;margin:0 0 28px;line-height:1.75;">
      I have received your message and will review it carefully. You can expect a response within <strong style="color:#ff8800;">24–48 hours</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#181a22;border-radius:12px;border:1px solid rgba(255,107,0,0.3);margin-bottom:28px;">
      <tr>
        <td style="padding:18px 20px;border-left:4px solid #ff6b00;">
          <p style="font-size:12px;font-weight:700;color:#ff8800;margin:0 0 10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">What Happens Next?</p>
          <p style="font-size:14px;color:#c4c8d6;line-height:1.8;margin:0;">
            &bull; Message stored in admin portal<br/>
            &bull; Reviewing project details & inquiries<br/>
            &bull; Direct reply sent to your email inbox
          </p>
        </td>
      </tr>
    </table>

    ${ctaBtn(process.env.CLIENT_URL || "https://lokeshsain.vercel.app", "Explore Portfolio &rarr;")}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:32px;">
      <tr><td style="padding-top:20px;">
        <p style="font-size:13px;color:#858899;margin:0 0 4px;">Best regards,</p>
        <p style="font-size:17px;font-weight:900;color:#ffffff;margin:0 0 2px;">Lokesh Sain</p>
        <p style="font-size:12px;color:#ff8800;margin:0;font-family:monospace;">Software Engineer</p>
      </td></tr>
    </table>`,
    footerNote: "Automated confirmation response",
  });

/* ════════════════════════════════════════════════════════════════════════════
   2. ADMIN NOTIFICATION EMAIL — 3D Spatial Theme
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
    headerBg: "linear-gradient(135deg, #1c1512 0%, #111216 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff8800;letter-spacing:-0.03em;">⚡ New Contact Submission</div>
        <div style="font-size:12px;color:#a0a5b5;margin-top:4px;font-family:monospace;">Portfolio Contact Form</div>
      </td>
    </tr></table>`,
    bodyContent: `
    ${infoBlock(
      "Sender Details",
      infoRow("Name", esc(name)) +
      infoRow("Email", `<a href="mailto:${esc(email)}" style="color:#ff8800;font-weight:bold;text-decoration:none;">${esc(email)}</a>`) +
      infoRow("Time", esc(dateStr || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })), true)
    )}

    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff8800;font-family:monospace;margin:0 0 8px;">Message</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#181a22;border:1px solid rgba(255,107,0,0.3);border-radius:12px;padding:18px;font-size:14px;color:#f0f2f8;line-height:1.75;white-space:pre-wrap;word-break:break-word;">
          ${esc(message)}
        </td>
      </tr>
    </table>

    ${ctaBtn(`mailto:${esc(email)}?subject=Re: Your message&body=Hi ${esc(name)},`, `Reply to ${esc(name)} &rarr;`)}

    <div style="margin-top:28px;">
    ${infoBlock(
      "Technical Details",
      infoRow("IP Address", esc(normaliseIp(ip))) +
      infoRow("Device", esc(device || "Unknown")) +
      infoRow("Browser", esc(browser || "Unknown"), true)
    )}
    </div>`,
    footerNote: "Portfolio Admin Notification",
  });

/* ════════════════════════════════════════════════════════════════════════════
   3. LOGIN ALERT EMAIL
  ════════════════════════════════════════════════════════════════════════════ */
exports.loginAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerBg: "linear-gradient(135deg, #1c1512 0%, #111216 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff8800;letter-spacing:-0.03em;">🔐 Admin Login Detected</div>
        <div style="font-size:12px;color:#a0a5b5;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.75;color:#c4c8d6;margin:0 0 24px;">
      A successful login was recorded on your portfolio admin dashboard.
    </p>
    ${infoBlock(
      "Session Details",
      infoRow("Time", esc(dateStr || "Unknown")) +
      infoRow("IP Address", esc(normaliseIp(ip))) +
      infoRow("Device", esc(device || "Unknown")) +
      infoRow("Browser", esc(browser || "Unknown"), true)
    )}
    ${ctaBtn((process.env.CLIENT_URL || "https://lokeshsain.vercel.app") + "/admin", "Go to Admin Dashboard &rarr;")}`,
    footerNote: "Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   4. LOGOUT ALERT EMAIL
  ════════════════════════════════════════════════════════════════════════════ */
exports.logoutAlertEmail = ({ ip, browser, device, dateStr }) =>
  base({
    headerBg: "linear-gradient(135deg, #181a24 0%, #111218 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;">🚪 Admin Logout</div>
        <div style="font-size:12px;color:#858899;margin-top:4px;font-family:monospace;">${esc(dateStr || new Date().toLocaleString())}</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.75;color:#c4c8d6;margin:0 0 24px;">
      Your admin session was ended. JWT session token invalidated.
    </p>
    ${infoBlock(
      "Session Details",
      infoRow("Time", esc(dateStr || "Unknown")) +
      infoRow("IP Address", esc(normaliseIp(ip))) +
      infoRow("Device", esc(device || "Unknown")) +
      infoRow("Browser", esc(browser || "Unknown"), true)
    )}`,
    footerNote: "Security Alert",
  });

/* ════════════════════════════════════════════════════════════════════════════
   5. 2FA CODE EMAIL
  ════════════════════════════════════════════════════════════════════════════ */
exports.twoFactorEmail = (code) =>
  base({
    headerBg: "linear-gradient(135deg, #1c1512 0%, #111216 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff8800;letter-spacing:-0.03em;">🛡️ Verification Code</div>
        <div style="font-size:12px;color:#a0a5b5;margin-top:4px;font-family:monospace;">Two-Factor Authentication</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.8;color:#c4c8d6;margin:0 0 24px;">Enter this code to complete admin login:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background:#181a22;border:1px solid #ff6b00;border-radius:14px;padding:28px 20px;">
          <div style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#ff8800;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#7a7e8c;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#ffffff;">10 minutes</strong> &bull; Do not share this code
    </p>`,
    footerNote: "Admin Security",
  });

/* ════════════════════════════════════════════════════════════════════════════
   6. PASSWORD RESET OTP EMAIL
  ════════════════════════════════════════════════════════════════════════════ */
exports.resetPasswordEmail = (code) =>
  base({
    headerBg: "linear-gradient(135deg, #1c1512 0%, #111216 100%)",
    headerContent: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:22px;font-weight:900;color:#ff8800;letter-spacing:-0.03em;">🔑 Reset Your Password</div>
        <div style="font-size:12px;color:#a0a5b5;margin-top:4px;font-family:monospace;">Admin Password Recovery</div>
      </td>
    </tr></table>`,
    bodyContent: `
    <p style="font-size:15px;line-height:1.8;color:#c4c8d6;margin:0 0 24px;">
      Password reset code requested for admin account:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" style="background:#181a22;border:1px solid #ff6b00;border-radius:14px;padding:28px 20px;">
          <div style="font-size:44px;font-weight:900;letter-spacing:0.35em;font-family:monospace;color:#ff8800;line-height:1;">${esc(code)}</div>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#7a7e8c;text-align:center;margin:0;font-family:monospace;">
      Expires in <strong style="color:#ffffff;">10 minutes</strong> &bull; Do not share this code
    </p>`,
    footerNote: "Admin Password Recovery",
  });
