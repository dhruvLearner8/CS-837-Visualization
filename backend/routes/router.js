const express = require('express');
const router = express.Router();
const CountryData = require('../models/countryData');

// Insert Test Data Route
router.get('/add-test', async (req, res) => {
//   const testEntry = new CountryData({
//     entity: "Afghanistan",
//     code: "AFG",
//     year: 1950,
//     co2_emissions_per_capita: 0.010837195,
//     gdp_per_capita: 1156,
//     population: 7776182,
//     region: "Asia"
// });

  await testEntry.save();
  res.send('Test data inserted!');
});

module.exports = router;
