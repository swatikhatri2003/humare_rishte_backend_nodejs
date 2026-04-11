const crypto = require('crypto');
const nodemailer = require('nodemailer');

/** @deprecated kept for local/testing scripts that still import it */
const FIXED_OTP = '1234';

/** Numeric OTP for `email_otp` / `mobile_otp` columns (4–10 chars per validator). */
function generateOtp(digits = 6) {
  const d = Math.min(10, Math.max(4, Number(digits) || 6));
  const min = 10 ** (d - 1);
  const max = 10 ** d - 1;
  return String(crypto.randomInt(min, max + 1));
}

let cachedTransport = null;
let cachedTransportFailed = false;

function getSmtpTransport() {
  if (cachedTransportFailed) return null;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user, pass },
    });
  }
  return cachedTransport;
}

async function sendEmailOtp(toAddress, otp) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transport = getSmtpTransport();
  const text = `Your OTP is ${otp}. Use it to verify your email on Humare Rishte.`;

  if (!transport || !from) {
    console.log(`[OTP EMAIL → ${toAddress}] ${otp}`);
    return { channel: 'email', delivered: 'console' };
  }

  try {
    await transport.sendMail({
      from,
      to: toAddress,
      subject: 'Your verification OTP',
      text,
    });
    return { channel: 'email', delivered: 'smtp' };
  } catch (e) {
    cachedTransportFailed = true;
    console.error('SMTP send failed, falling back to console:', e.message);
    console.log(`[OTP EMAIL → ${toAddress}] ${otp}`);
    return { channel: 'email', delivered: 'console' };
  }
}

async function sendSmsOtp(mobile, otp) {
  const url = process.env.SMS_WEBHOOK_URL;
  const message = `Your OTP is ${otp}. Use it to verify your mobile on Humare Rishte.`;

  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, message, otp }),
      });
      if (!res.ok) {
        console.warn(`SMS_WEBHOOK_URL responded ${res.status}; logging OTP to console.`);
        console.log(`[OTP SMS → ${mobile}] ${otp}`);
        return { channel: 'sms', delivered: 'console' };
      }
      return { channel: 'sms', delivered: 'webhook' };
    } catch (e) {
      console.warn('SMS webhook failed:', e.message);
      console.log(`[OTP SMS → ${mobile}] ${otp}`);
      return { channel: 'sms', delivered: 'console' };
    }
  }

  console.log(`[OTP SMS → ${mobile}] ${otp}`);
  return { channel: 'sms', delivered: 'console' };
}

module.exports = { FIXED_OTP, generateOtp, sendEmailOtp, sendSmsOtp };
