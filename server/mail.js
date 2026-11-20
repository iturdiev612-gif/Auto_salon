import nodemailer from 'nodemailer';

export function mailConfigured() {
  return Boolean((process.env.RESEND_API_KEY && process.env.MAIL_FROM) || (process.env.SMTP_HOST && (process.env.SMTP_FROM || process.env.SMTP_USER)));
}

export async function sendMail({ to, subject, text }) {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text }),
    });
    if (!response.ok) throw new Error('Mail provider rejected the message');
    return;
  }
  if (!mailConfigured()) throw new Error('Mail provider is not configured');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {}),
    connectionTimeout: 5000, socketTimeout: 10000,
  });
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
}
