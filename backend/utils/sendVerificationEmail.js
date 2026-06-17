import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (to, token) => {
  const emailUser = process.env.EMAIL_USER || 'aksharjain034@gmail.com';
  const emailPass = process.env.EMAIL_PASS;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173/';
  const verifyUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}verify?token=${token}`;

  const mailOptions = {
    from: `"ShopyZone" <${emailUser}>`,
    to,
    subject: 'Verify your login – ShopyZone',
    text: `Hello,\n\nYou requested to login to ShopyZone.\nClick the link below to verify:\n\n${verifyUrl}\n\nThis link expires in 15 minutes.\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; text-align: center; font-family: sans-serif; letter-spacing: 2px;">SHOPYZONE</h2>
        <p style="font-size: 14px; color: #334155;">Hello,</p>
        <p style="font-size: 14px; color: #334155;">You requested to login to <strong>ShopyZone</strong>.</p>
        <p style="font-size: 14px; color: #334155;">Click the button below to verify & login:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px;">Verify & Login</a>
        </div>
        <p style="font-size: 11px; color: #64748b; line-height: 1.5;">This link expires in 15 minutes.<br/>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
      await transporter.sendMail(mailOptions);
      console.log(`[SMTP Magic Link Sent] To: ${to}`);
      return true;
    } catch (error) {
      console.error('[SMTP Magic Link Error] Failed to send email via Gmail:', error.message);
    }
  }

  // Fallback: log to console
  const consoleLine = '='.repeat(60);
  console.log(`
${consoleLine}
[SIMULATED MAGIC LINK EMAIL FOR DEVELOPMENT]
To:      ${to}
Subject: Verify your login – ShopyZone
Link:    ${verifyUrl}
${consoleLine}
  `);
  return true;
};
