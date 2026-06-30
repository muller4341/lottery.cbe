

const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../lib/jwt');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); // Import nodemailer

// Initialize secure SMTP email transporter asset pool
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Existing login, me, and signup methods remain here...

exports.requestResetToken = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, message: 'Email address is required' });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(404).json({ ok: false, message: 'No account associated with this email address' });
    }

    // Generate secure 6-digit numeric token string (cleaner for users to copy/paste from an email)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes

    await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    // Fire the email securely using the transporter instance
    const mailOptions = {
      from: `"CBE House Lottery" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🔒 Reset Your  Admin Portal Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="background: linear-gradient(135deg, #95298E 0%, #7D1E76 100%); padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Commercial Bank of Ethiopia</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #d4af37; font-weight: bold;">የኢትዮጵያ ንግድ ባንክ</p>
          </div>
          <div style="padding: 32px; background-color: white; color: #334155;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Password Recovery Request</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">Hello <strong>${user.fullName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">We received a request to reset your password for the House Lottery Admin Portal. Use the secure verification code below to proceed:</p>
            
            <div style="margin: 24px 0; text-align: center;">
              <span style="display: inline-block; background-color: #f8fafc; border: 2px dashed #95298E; padding: 12px 32px; font-size: 26px; font-family: monospace; font-weight: 900; color: #95298E; letter-spacing: 4px; rounded: 8px;">
                ${token}
              </span>
            </div>
            
            <p style="font-size: 12px; color: #94a3b8; font-style: italic; margin-bottom: 0;">This code is strictly confidential and will expire in 15 minutes.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Securely hide the token from the HTTP response context completely
    return res.json({ 
      ok: true, 
      message: 'A secure verification code has been dispatched to your email address.' 
    });
  } catch (err) {
    console.error('Nodemailer pipeline breakdown error:', err);
    return res.status(500).json({ ok: false, message: 'Failed to dispatch verification email.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {}; // 'username' here handles both input types
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Username/Email and password are required' });
    }

    // Dynamic Lookup: Matches either username OR email address fields cleanly
    const user = await prisma.user.findFirst({ 
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const token = signToken({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    });

    return res.json({
      ok: true,
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        fullName: user.fullName,
        role: user.role 
      },
    });
  } catch (err) {
    console.error('Login system engine failure:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    return res.json({
      ok: true,
      user: { 
        id: user.id, 
        username: user.username, 
        fullName: user.fullName,
        role: user.role 
      },
    });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, fullName, username } = req.body || {};

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ ok: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ ok: false, message: 'Passwords do not match' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(409).json({ ok: false, message: 'Username or email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username: username.trim(),
        fullName: fullName.trim(),
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    const token = signToken({ id: user.id, username: user.username, role: user.role });

    return res.json({
      ok: true,
      token,
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role }
    });
  } catch (err) {
    console.error('Signup engine failure:', err);
    return res.status(500).json({ ok: false, message: 'Server error during registration' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({ ok: false, message: 'Email and new password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, message: 'Passwords do not match' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ ok: false, message: 'No account associated with this email address' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return res.json({ ok: true, message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Password reset failure:', err);
    return res.status(500).json({ ok: false, message: 'Server error during password recovery' });
  }
};



// 2. Consume token to securely overwrite old database password
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({ ok: false, message: 'Token and new password parameters are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, message: 'Passwords do not match' });
    }

    // Lookup user checking token matching and expiry constraints
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() } // Check token is not expired
      }
    });

    if (!user) {
      return res.status(400).json({ ok: false, message: 'Invalid or expired password reset token context' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token columns immediately
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.json({ ok: true, message: 'Password updated successfully! Redirecting...' });
  } catch (err) {
    console.error('Token processing error:', err);
    return res.status(500).json({ ok: false, message: 'Server error during password overwrite' });
  }
};