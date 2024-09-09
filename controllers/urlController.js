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
    res.json({ error: 'invalid url' });  // Return error if URL is invalid
  }
};

// Handle redirecting to the original URL based on short URL
exports.redirectUrl = async (req, res) => {
  const { short_url } = req.params;

  try {
    // Retrieve the original URL from the database
    const urlData = await urlService.getOriginalUrl(short_url);
    
    // If the short URL is not found in the database, return a 404 error
    if (!urlData) {
      return res.status(404).json({ error: 'No URL found' });
    }

    // Ensure the original URL has a protocol (http or https). If not, prepend 'http://'
    const redirectUrl = /^https?:\/\//.test(urlData.original_url)
      ? urlData.original_url
      : `http://${urlData.original_url}`;

    // Redirect to the properly formatted original URL
    return res.redirect(redirectUrl);
  } catch (err) {
    // Handle any server errors and send a 500 response
    return res.status(500).json({ error: 'Server error' });
  }
};

