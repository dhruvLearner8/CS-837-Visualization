const express = require('express');
const router = express.Router();
const CountryData = require('../models/countryData');

// Route to get all country data
router.get('/', async (req, res) => {
  try {
    const data = await CountryData.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
