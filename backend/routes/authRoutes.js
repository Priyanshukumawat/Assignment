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


router.post('/login', authController.login);


module.exports = router;
