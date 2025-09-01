const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });


router.post('/register', upload.single('avatar'), authController.register);
router.get('/verify-email', authController.verifyEmail);

router.post('/login', authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
module.exports = router;
