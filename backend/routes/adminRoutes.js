const express = require('express');
const router = express.Router();

const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Get all users
router.get('/users', authMiddleware, adminController.getAllUsers);

// Delete a user
router.delete('/users/:id', authMiddleware, isAdmin, adminController.deleteUser);

module.exports = router;
