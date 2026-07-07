const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { uploadWebsite } = require('../config/cloudinary');
const {
  getHomePage,
  updateHomePage,
  uploadHomeImage,
} = require('../controllers/homePageController');

router.get('/', getHomePage);
router.put('/', authMiddleware, updateHomePage);
router.post('/upload-image', authMiddleware, uploadWebsite.single('image'), uploadHomeImage);

module.exports = router;
