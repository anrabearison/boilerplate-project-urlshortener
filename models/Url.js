const mongoose = require('mongoose');

// Schema for shortened URLs
const UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Url', UrlSchema);
