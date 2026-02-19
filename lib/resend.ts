import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM = "docfocal <hello@docfocal.com>";

// ── Email templates ────────────────────────────────────────────────────────

export function welcomeEmailHtml(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#111;padding:24px 32px;">
          <span style="font-size:20px;font-weight:700;color:#fff;">doc<span style="color:#e10600;">focal</span></span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111;">Welcome, ${name}!</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
            Your account is ready. Here's what you can do right now:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${[
              ["📝", "Write documents", "Rich-text editor with export to PDF and DOCX"],
              ["📄", "PDF Toolkit", "Merge, split, compress, rotate, sign, and more"],
              ["🎯", "CV Builder", "Professional templates with one-click export"],
              ["🔄", "Convert", "PDF ↔ Word, EPUB, JPEG and more"],
            ]
              .map(
                ([icon, title, desc]) => `
            <tr>
              <td style="padding:10px 0;vertical-align:top;">
                <span style="font-size:20px;margin-right:12px;">${icon}</span>
              </td>
              <td style="padding:10px 0;">
                <strong style="display:block;font-size:14px;color:#111;">${title}</strong>
                <span style="font-size:13px;color:#6b7280;">${desc}</span>
              </td>
            </tr>`
              )
              .join("")}
          </table>
          <a href="https://docfocal.com/dashboard"
            style="display:inline-block;background:#e10600;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Go to dashboard →
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            You're receiving this because you created a docfocal account.
            Questions? Reply to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function proUpgradeEmailHtml(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="background:#111;padding:24px 32px;">
          <span style="font-size:20px;font-weight:700;color:#fff;">doc<span style="color:#e10600;">focal</span></span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111;">You're on Pro ✦</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
            Thanks, ${name}! Your Pro subscription is now active. Enjoy unlimited energy,
            larger uploads, more CV templates, and no watermarks.
          </p>
          <a href="https://docfocal.com/dashboard"
            style="display:inline-block;background:#e10600;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Start using Pro →
          </a>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Manage your subscription at docfocal.com/dashboard/settings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
