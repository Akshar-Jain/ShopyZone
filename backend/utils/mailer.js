import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter = null;

if (hasSMTP) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an email using configured SMTP transporter, or fall back to terminal logging.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (hasSMTP && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ShopyZone" <noreply@shopyzone.com>',
        to,
        subject,
        text,
        html,
      });
      console.log(`[SMTP Email Sent] To: ${to} | Subject: ${subject}`);
      return true;
    } catch (error) {
      console.error('[SMTP Email Error] Failed to send email via SMTP:', error.message);
    }
  }

  // Fallback: log to console
  const consoleLine = '='.repeat(60);
  console.log(`
${consoleLine}
[SIMULATED EMAIL FOR DEVELOPMENT]
To:      ${to}
Subject: ${subject}
Message: ${text}
HTML:
${html}
${consoleLine}
  `);
  return true;
};
