import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Cart, VerificationToken } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { Op } from 'sequelize';
import { ADMIN_EMAIL } from '../config/constants.js';
import { generateVerificationToken } from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'shopyzone_super_secret_jwt_key_2026';

// 1. SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.value || req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP verification token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const userRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    // Create user (unverified by default)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: otp,
      verificationTokenExpires: otpExpires,
      isVerified: false,
      role: userRole,
    });

    // Create empty cart for the user
    await Cart.create({ userId: user.id, items: [] });

    // Send email
    const subject = 'Verify your ShopyZone Account';
    const text = `Hi ${name},\n\nYour OTP for verifying your ShopyZone account is: ${otp}.\nIt is valid for 15 minutes.`;
    const html = `
      <h3>Welcome to ShopyZone!</h3>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
      <h2 style="letter-spacing: 2px; color: #4F46E5;">${otp}</h2>
      <p>This OTP is valid for 15 minutes.</p>
    `;

    await sendEmail({ to: email, subject, text, html });

    res.status(201).json({
      message: 'Signup successful! Verification OTP sent to your email.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. VERIFY EMAIL (OTP)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (user.verificationToken !== otp || new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 3. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact customer support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Please verify your email before logging in.',
        isVerified: false,
        email: user.email,
      });
    }

    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send login alert email in the background
    sendEmail({
      to: user.email,
      subject: 'Successful Login Alert - ShopyZone',
      text: `Hi ${user.name},\n\nYou have successfully logged into your ShopyZone account on ${new Date().toLocaleString()}.\nIf this wasn't you, please secure your account immediately.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">ShopyZone Login Alert</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully logged into your ShopyZone account on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If this was you, you can safely ignore this email.</p>
          <p style="color: #EF4444; font-weight: bold;">If you did not perform this action, please secure your account immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999;">This is an automated alert from ShopyZone. Please do not reply.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send login notification email:', err.message));

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        savedCards: user.savedCards,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 4. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email found.' });
    }

    // Generate reset token (6-digit code for simplicity)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Send email
    const subject = 'Password Reset OTP - ShopyZone';
    const text = `You requested a password reset. Use this OTP code to reset your password: ${resetCode}.\nIt is valid for 15 minutes.`;
    const html = `
      <h3>ShopyZone Password Reset</h3>
      <p>We received a request to reset your password. Use the code below to reset it:</p>
      <h2 style="letter-spacing: 2px; color: #EF4444;">${resetCode}</h2>
      <p>This code is valid for 15 minutes.</p>
    `;

    await sendEmail({ to: email, subject, text, html });

    res.status(200).json({ message: 'Password reset OTP code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 5. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }

    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash and update
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 6. GET CURRENT USER PROFILE & UPDATE
router.get('/me', verifyToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, addresses, savedCards } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (addresses) user.addresses = addresses;
    if (savedCards) user.savedCards = savedCards;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        savedCards: user.savedCards,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 7. OAUTH SUCCESS SIMULATION
router.post('/oauth-success', async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required.' });
    }

    let user = await User.findOne({ where: { email } });

    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact customer support.' });
      }
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
      } else if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Auto-generate a password and register user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const userRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        role: userRole
      });

      await Cart.create({ userId: user.id, items: [] });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send successful login email alert
    sendEmail({
      to: user.email,
      subject: `Logged in via ${provider || 'OAuth'} - ShopyZone`,
      text: `Hi ${user.name},\n\nYou have successfully logged into your ShopyZone account using ${provider || 'OAuth'} on ${new Date().toLocaleString()}.\nIf this wasn't you, please secure your account immediately.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">ShopyZone Login Alert</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully logged into your ShopyZone account using <strong>${provider || 'Google/Microsoft'}</strong> on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If this was you, you can safely ignore this email.</p>
          <p style="color: #EF4444; font-weight: bold;">If you did not perform this action, please secure your account immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999;">This is an automated alert from ShopyZone. Please do not reply.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send oauth login alert:', err.message));

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        savedCards: user.savedCards,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 8. GOOGLE OAUTH LOGIN
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google token is required.' });
    }

    let email, name, picture;

    // Determine if it is a JWT (ID Token) or an Access Token
    if (token.includes('.') && token.split('.').length === 3) {
      const decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(400).json({ message: 'Invalid Google token.' });
      }
      email = decoded.email;
      name = decoded.name;
      picture = decoded.picture;
    } else {
      // It's an Access Token. Fetch user info from Google API.
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        const userInfo = await userInfoRes.json();
        email = userInfo.email;
        name = userInfo.name;
        picture = userInfo.picture;
      } catch (err) {
        // Fallback: try resolving via tokeninfo
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!tokenInfoRes.ok) {
          return res.status(400).json({ message: 'Failed to verify Google token.', error: err.message });
        }
        const tokenInfo = await tokenInfoRes.json();
        email = tokenInfo.email;
        name = tokenInfo.name || tokenInfo.email.split('@')[0];
        picture = tokenInfo.picture;
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not extract email from Google token.' });
    }

    let user = await User.findOne({ where: { email } });

    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact customer support.' });
      }
      // Check admin status
      const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
      } else if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Auto-create user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const userRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        isVerified: true,
        role: userRole
      });

      await Cart.create({ userId: user.id, items: [] });
    }

    // Generate ShopyZone JWT
    const shopyzoneToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send successful login email alert
    sendEmail({
      to: user.email,
      subject: 'Logged in via Google - ShopyZone',
      text: `Hi ${user.name},\n\nYou have successfully logged into your ShopyZone account using Google on ${new Date().toLocaleString()}.\nIf this wasn't you, please secure your account immediately.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">ShopyZone Login Alert</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully logged into your ShopyZone account using <strong>Google</strong> on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If this was you, you can safely ignore this email.</p>
          <p style="color: #EF4444; font-weight: bold;">If you did not perform this action, please secure your account immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999;">This is an automated alert from ShopyZone. Please do not reply.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send Google login alert email:', err.message));

    res.status(200).json({
      message: 'Login successful.',
      token: shopyzoneToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        savedCards: user.savedCards,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 9. SEND MAGIC LINK
router.post('/send-link', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate token and expires
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Store token in database
    await VerificationToken.create({
      email: cleanEmail,
      token,
      expiresAt,
      verified: false
    });

    // Send the email
    await sendVerificationEmail(cleanEmail, token);

    res.status(200).json({ message: 'Verification magic link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 10. VERIFY MAGIC LINK
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const record = await VerificationToken.findOne({ where: { token } });
    if (!record) {
      return res.status(400).json({ message: 'Verification link is invalid or has already been used.' });
    }

    if (new Date() > record.expiresAt) {
      await record.destroy();
      return res.status(400).json({ message: 'Verification link has expired.' });
    }

    const email = record.email.toLowerCase().trim();

    // Find or create user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Auto-register
      const name = email.split('@')[0];
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const userRole = email === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        role: userRole
      });

      await Cart.create({ userId: user.id, items: [] });
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Delete token after successful single use
    await record.destroy();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        savedCards: user.savedCards,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

export default router;
