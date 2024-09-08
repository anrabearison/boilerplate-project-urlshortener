require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
connectDB();
// Mount routes
app.use('/api', urlRoutes);
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
