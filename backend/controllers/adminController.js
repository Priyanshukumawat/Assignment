// controllers/adminController.js
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isVerified", "createdAt"],
    });
    return res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Server error while fetching users" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.destroy({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `User "${user.name || user.email}" deleted successfully`
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
};
