const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
    const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, 'my_super_secret_access_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function isAdmin(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    return res.status(500).json({ message: 'Server error checking admin role' });
  }
}

module.exports = { authMiddleware, isAdmin };
