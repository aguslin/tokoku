const express = require('express');
const router = express.Router();
const { uploadMultiple } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');

router.post('/images', authenticate, uploadMultiple('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const files = req.files.map((f) => ({
    url: `/uploads/${f.filename}`,
    name: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
  }));
  res.json({ success: true, data: files, message: 'Files uploaded successfully' });
});

module.exports = router;
