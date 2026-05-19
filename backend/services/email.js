'use strict';
require('dotenv').config();
const nodemailer = require('nodemailer');

let _transporter = null;
let _resendClient  = null;

// ─── Resend (HTTP API — works on Render free tier) ────────────────────────────
function getResendClient() {
  if (_resendClient) return _resendClient;
  const { Resend } = require('resend');
  _resendClient = new Resend(process.env.RESEND_API_KEY);
  return _resendClient;
}

// ─── Nodemailer / Ethereal (SMTP — blocked on Render free tier) ───────────────
async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.EMAIL_MODE === 'ethereal') {
    const account = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      connectionTimeout: 5000,
      socketTimeout: 5000,
      greetingTimeout: 5000,
      auth: { user: account.user, pass: account.pass },
    });
    console.log(`[Email] Ethereal account: ${account.user}`);
  } else {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      connectionTimeout: 5000,
      socketTimeout: 10000,
      greetingTimeout: 5000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _transporter;
}

// ─── sendOTP ──────────────────────────────────────────────────────────────────
async function sendOTP(toEmail, otp) {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <h2 style="color:#1A3C5E;margin-bottom:8px;">HomeFinder – Verification Code</h2>
      <p style="color:#64748b;margin-bottom:24px;">Use the code below to complete your sign-in. It expires in <strong>5 minutes</strong>.</p>
      <div style="font-size:2.5rem;font-weight:800;letter-spacing:0.3em;color:#1A3C5E;text-align:center;padding:24px;background:#fff;border-radius:8px;border:2px solid #e2e8f0;">
        ${otp}
      </div>
      <p style="color:#94a3b8;font-size:0.8rem;margin-top:24px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  if (process.env.EMAIL_MODE === 'resend') {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: 'HomeFinder <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Your HomeFinder verification code',
      html,
      text: `Your 6-digit code is: ${otp}\n\nThis code expires in 5 minutes.`,
    });
    if (error) throw new Error(error.message);
    console.log(`[Email] OTP sent via Resend to ${toEmail}`);
    return null;
  }

  // Ethereal / SMTP path
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"HomeFinder" <noreply@homefinder.com>',
    to: toEmail,
    subject: 'Your HomeFinder verification code',
    text: `Your 6-digit code is: ${otp}\n\nThis code expires in 5 minutes.`,
    html,
  });

  if (process.env.EMAIL_MODE === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email] OTP for ${toEmail}: ${otp}`);
    console.log(`[Email] Preview URL: ${previewUrl}`);
    return previewUrl;
  }
  return null;
}

// ─── sendConfirmation ─────────────────────────────────────────────────────────
async function sendConfirmation(toEmail, subject, htmlBody) {
  if (process.env.EMAIL_MODE === 'resend') {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: 'HomeFinder <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      html: htmlBody,
    });
    if (error) throw new Error(error.message);
    return;
  }

  // Ethereal / SMTP path
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"HomeFinder" <noreply@homefinder.com>',
    to: toEmail,
    subject,
    html: htmlBody,
  });
  if (process.env.EMAIL_MODE === 'ethereal') {
    console.log(`[Email] Confirmation sent to ${toEmail}: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

module.exports = { sendOTP, sendConfirmation };
