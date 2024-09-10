require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json());
// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Serve static files from the public directory
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the main HTML file for the homepage
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Simple API endpoint for testing
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Array to store the shortened URLs
const urlDatabase = [];

// Endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  try {
    // Parse the URL sent in the request
    const originalUrl = new URL(req.body.url);
    const domain = originalUrl.hostname;

    // Check if the domain is valid using DNS lookup
    dns.lookup(domain, (err) => {
      if (err) {
        // If domain is invalid, return error
        return res.json({ error: 'invalid url' });
      } else {
        // If the URL is valid, store it if not already in the database
        if (!urlDatabase.includes(originalUrl.href)) {
          urlDatabase.push(originalUrl.href);
        }
        // Return the original URL and its short version (index in the array + 1)
        return res.json({
          original_url: originalUrl.href,
          short_url: urlDatabase.indexOf(originalUrl.href) + 1
        });
      }
    });
  } catch (err) {
    // Catch any error that occurs during URL parsing
    return res.json({ error: 'invalid url' });
  }
});

// Endpoint to redirect to the original URL based on the short URL
app.get('/api/shorturl/:id', (req, res) => {
  const shortUrlId = req.params.id;
  const originalUrl = urlDatabase[shortUrlId - 1];

  // Redirect to the original URL if found
  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No URL found' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
