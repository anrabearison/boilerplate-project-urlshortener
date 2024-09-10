require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const app = express();

app.use(express.json());
// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({extended: false}));

// Basic Configuration
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


// Définir le schéma pour l'URL raccourcie
const urlSchema = new mongoose.Schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});

const Url = mongoose.model('Url', urlSchema);

// Fonction pour générer un identifiant unique pour les URLs raccourcies
const generateShortUrl = () => Math.floor(Math.random() * 100000).toString();

// Fonction pour vérifier si une URL est valide
const isValidUrl = (url) => {
    // Utilisation de valid-url pour vérifier si l'URL est valide
    if (validUrl.isUri(url)) {
        return true;
    } else {
        return false;
    }
};

// Route POST pour créer un raccourcissement d'URL
app.post('/api/shorturl', async (req, res) => {
  const { url: originalUrl } = req.body;

  try {
    // Vérifier que l'URL est valide en utilisant l'objet URL
    const domain = new URL(originalUrl).hostname;

    // Vérification du domaine via DNS
    dns.lookup(domain, async (err) => {
      if (err) {
        console.log('err', err)
        return res.json({ error: "invalid url" });
      }

      try {
        // Vérifier si l'URL existe déjà dans la base de données
        let existingUrl = await Url.findOne({ original_url: originalUrl });
        if (existingUrl) {
          return res.json({ original_url: existingUrl.original_url, short_url: existingUrl.short_url });
        }

        // Générer une nouvelle URL raccourcie
        const shortUrl = generateShortUrl();
        const newUrl = new Url({
          original_url: originalUrl,
          short_url: shortUrl
        });

        await newUrl.save();

        return res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  } catch (err) {
    // Si l'URL n'est pas valide dès le départ, renvoyer une erreur
    return res.json({ error: "invalid url" });
  }
});


// Route GET pour rediriger vers l'URL d'origine
app.get('/api/shorturl/:short_url', async (req, res) => {
    const {short_url} = req.params;

    try {
        const url = await Url.findOne({short_url});
        if (url) {
            return res.redirect(url.original_url);
        } else {
            return res.status(404).json({error: 'No URL found'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});


app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
