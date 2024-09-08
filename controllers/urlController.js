const UrlService = require('../services/UrlService');
const urlService = new UrlService();

// Handle the creation of a shortened URL
exports.createShortUrl = async (req, res) => {
  const { url } = req.body;

  try {
    // Validate the submitted URL
    await urlService.validateUrl(url);

    // Create a new shortened URL entry
    const shortenedUrl = await urlService.shortenUrl(url);
    res.json(shortenedUrl);  // Return the shortened URL as JSON

  } catch (err) {
    res.json({ error: err });  // Return error if URL is invalid
  }
};

// Handle redirecting to the original URL based on short URL
exports.redirectUrl = async (req, res) => {
  const { short_url } = req.params;

  try {
    const urlData = await urlService.getOriginalUrl(short_url);
    
    if (!urlData) {
      return res.status(404).json({ error: 'No URL found' });
    }

    // Redirect to the original URL
    res.redirect(urlData.original_url);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
