// models/CountryData.js
const mongoose = require('mongoose');

const countryDataSchema = new mongoose.Schema({
  entity: String,
  code: String,
  year: Number,
  co2_emissions_per_capita: Number,
  gdp_per_capita: Number,
  population: Number,
  region: String
});

module.exports = mongoose.model('CountryData', countryDataSchema);
