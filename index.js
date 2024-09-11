require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const shortid = require('shortid');
const app = express();

app.use(express.json()); // Middleware to parse JSON data
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded data
app.use(bodyParser.json());
// Basic Configuration
const port = process.env.PORT || 3000;

connectDB(); // Connect to the database

app.use(cors()); // Enable CORS

// Serve static files from the 'public' folder
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the main HTML page
app.get('/', (req, res) => {
  return res.sendFile(process.cwd() + '/views/index.html');
});

// Define URL schema for MongoDB
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
});

const Url = mongoose.model('Url', urlSchema);


// POST route to create a short URL
app.post('/api/shorturl', async (req, res) => {
  const { url: originalUrl } = req.body;

  try {
    // Parse and validate the URL
    const parsedUrl = new URL(originalUrl);
    const domain = parsedUrl.hostname;
    const protocol = parsedUrl.protocol;

    // Check if protocol is http or https
    if (protocol !== 'http:' && protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // Perform DNS lookup to check if domain is valid
    dns.lookup(domain, async (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      try {
        // Check if the original URL already exists in the database
        let existingUrl = await Url.findOne({ original_url: originalUrl });
        if (existingUrl) {
          return res.json({ original_url: existingUrl.original_url, short_url: existingUrl.short_url });
        }

        // Generate a new short URL using shortid
        const shortUrl = shortid.generate();
        const newUrl = new Url({
          original_url: originalUrl,
          short_url: shortUrl
        });

        // Save the new short URL to the database
        await newUrl.save();

        // Return the original and short URL
        return res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
      } catch (err) {
        console.error('Database error:', err);
         res.status(500).json({ error: 'Server error' });
      }
    });
  } catch (err) {
    // Handle invalid URL format
    console.error('URL parsing error:', err);
    return res.json({ error: 'invalid url' });
  }
});

// GET route to redirect to the original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    // Find the original URL by the short URL
    const url = await Url.findOne({ short_url });
    if (url) {
      // Redirect to the original URL
      return res.redirect(url.original_url);
    } else {
       res.status(404).json({ error: 'No URL found' });
    }
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
