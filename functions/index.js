const functions = require("firebase-functions");
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// ✅ Apply CORS middleware properly
app.use(cors({origin: true}));
app.use(express.json());

// ✅ Proxy endpoint
app.get("/proxy", async (req, res) => {
  const url = req.query.url; // Get the URL from the query parameter

  if (!url) {
    return res.status(400).json({error: "Missing URL parameter"});
  }

  try {
    const response = await axios.get(url, {
      headers: {"User-Agent": "Mozilla/5.0"},
    });
    res.set("Access-Control-Allow-Origin", "*"); // ✅ Allow all origins
    res.json(response.data); // ✅ Send back data
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// ✅ Export as a Firebase Function
exports.api = functions.https.onRequest(app);

