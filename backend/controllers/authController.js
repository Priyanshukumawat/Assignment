const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer')
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const profileImage = req.file ? req.file.path : null;

    // ✅ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email and Password are required' });
    }

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage: req.file ? req.file.path.replace(/\\/g, "/") : null,
      verificationToken,
      isVerified: false,
      role: role || "user",
    });

    // ✅ Verification link
    const verifyUrl = `http://localhost:3001/api/auth/verify-email?token=${verificationToken}`;

    // ✅ Try sending email (don’t block registration if fails)
    try {
      await sendEmail(
        email,
        "Verify your account",
        `Hi ${name},\n\nClick the link below to verify your account:\n\n${verifyUrl}\n\nThanks,\nMyApp Team`
      );
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);
      // Still continue registration, just warn user
    }

    res.status(201).json({
      message: 'User registered successfully! Please check your email to verify your account.',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({
      error: 'Registration failed',
      details: err.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: err.message });
  }
};


// Define generateTokens BEFORE login
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    "my_super_secret_access_key",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    "my_super_secret_refresh_key",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const tokens = generateTokens(user); // ✅ now it works

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage, role: user.role },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } }); // Sequelize syntax
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token (15m expiry)
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_ACCESS_SECRET || "my_super_secret_access_key",
      { expiresIn: "15m" }
    );

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Reuse sendEmail util ✅
    await sendEmail(
      user.email,
      "Password Reset",
      resetUrl
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "my_super_secret_access_key"
    );

    const user = await User.findByPk(decoded.id); // ✅ Sequelize syntax
    if (!user) return res.status(400).json({ message: "Invalid token or user not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Invalid or expired token" });
  }
};


exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(refreshToken, "my_super_secret_refresh_key");


    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

