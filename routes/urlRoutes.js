const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// Route to create a shortened URL
router.post('/shorturl', urlController.createShortUrl);

// Route to redirect to the original URL using short URL
router.get('/shorturl/:short_url', urlController.redirectUrl);

module.exports = router;
