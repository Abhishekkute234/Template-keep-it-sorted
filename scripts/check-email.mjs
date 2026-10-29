// Checks that the email settings in .env.local can log in to the mail server. Sends nothing.
// Usage: npm run email:check
import nodemailer from "nodemailer";

const { GMAIL_USER, GMAIL_APP_PASSWORD, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

let transport;
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s+/g, "") },
  });
} else if (SMTP_HOST) {
  const port = Number(SMTP_PORT || 587);
  transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined });
} else {
  console.log("No email settings found in .env.local (GMAIL_USER + GMAIL_APP_PASSWORD, or SMTP_HOST).");
  process.exit(1);
}

try {
  await transport.verify();
  console.log(`OK: logged in to ${GMAIL_USER ? "Gmail" : SMTP_HOST}. Sign-in codes will be sent from: ${SMTP_FROM || GMAIL_USER || SMTP_USER}`);
} catch (err) {
  console.error(`FAILED: ${err.message}`);
  if (GMAIL_USER) console.error("Check that 2-Step Verification is on and the app password is current (https://myaccount.google.com/apppasswords).");
  process.exit(1);
}
