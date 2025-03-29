const express = require('express');
const axios = require('axios');
const cors = require('cors');  // Import CORS middleware
const app = express();

// Use CORS middleware to allow requests from your frontend
app.use(cors());  // This will allow requests from all origins by default

app.get('/proxy', async (req, res) => {
  const url = req.query.url; // Get the URL from the query parameter
  try {
    const response = await axios.get(url);
    res.json(response.data);  // Send the response back to the Angular app
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.use(cors({ origin: 'http://localhost:4200' }));

app.listen(3000, () => {
  console.log('Proxy server is running on http://localhost:3000');
});

