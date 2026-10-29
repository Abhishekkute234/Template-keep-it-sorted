import "server-only";
import nodemailer from "nodemailer";

const gmail = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
const configured = () => gmail() || !!process.env.SMTP_HOST;

/** True when real emails go out; false means dev mode prints codes to the terminal. */
export function emailEnabled() {
  return configured();
}

function transport() {
  if (gmail()) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // Google displays app passwords in groups of four; the spaces aren't part of it.
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
    });
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

function sender() {
  return process.env.SMTP_FROM || process.env.MAIL_FROM || (process.env.GMAIL_USER ? `Keep It Sorted <${process.env.GMAIL_USER}>` : "Keep It Sorted <no-reply@keepitsorted.dev>");
}

function otpHtml(code: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#07060b;font-family:Arial,Helvetica,sans-serif;color:#f2efe9">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
    <table width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#14121c;border-radius:20px;padding:36px">
      <tr><td style="font-size:12px;letter-spacing:3px;color:#d4ff3a;font-weight:bold">KEEP IT SORTED</td></tr>
      <tr><td style="padding:18px 0 8px;font-size:22px;font-weight:bold">Your sign-in code</td></tr>
      <tr><td style="font-size:15px;color:#a7a3b5;line-height:1.5">Enter this code to finish signing in. It expires in 10 minutes.</td></tr>
      <tr><td style="padding:26px 0">
        <div style="font-size:40px;letter-spacing:12px;font-weight:bold;color:#0b0a10;background:#d4ff3a;border-radius:14px;padding:16px 0;text-align:center">${code}</div>
      </td></tr>
      <tr><td style="font-size:13px;color:#6f6b80;line-height:1.5">If you didn't ask for this, you can safely ignore this email. Someone may have typed your address by mistake.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendOtpEmail(to: string, code: string) {
  if (!configured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (set GMAIL_USER + GMAIL_APP_PASSWORD, or SMTP_HOST).");
    console.log(`\n[keep-it-sorted] Sign-in code for ${to}: ${code}  (dev mode: set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local to send real email)\n`);
    return;
  }
  try {
    await deliver(to, code);
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    console.warn(`\n[keep-it-sorted] Email failed (${(err as Error).message.split("\n")[0]}). Run "npm run email:check" to diagnose.`);
    console.log(`[keep-it-sorted] Sign-in code for ${to}: ${code}  (dev fallback)\n`);
  }
}

async function deliver(to: string, code: string) {
  await transport().sendMail({
    from: sender(),
    to,
    subject: `${code} is your Keep It Sorted sign-in code`,
    text: `Your Keep It Sorted sign-in code is ${code}. It expires in 10 minutes. If you didn't request it, ignore this email.`,
    html: otpHtml(code),
  });
}
