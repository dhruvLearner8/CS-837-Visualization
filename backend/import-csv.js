const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const CountryData = require('./models/countryData');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Read CSV and insert data
const results = [];
fs.createReadStream('final.csv') // CHANGE this to your real CSV filename
  .pipe(csv())
  .on('data', (row) => {
    results.push({
      entity: row['Entity'],
      code: row['Code'],
      year: parseInt(row['Year']),
      co2_emissions_per_capita: parseFloat(row['Annual CO₂ emissions (per capita)']) || 0,
      gdp_per_capita: parseFloat(row['GDP per capita']) || 0,
      population: parseInt(row['Population (historical)']) || 0,
      region: row['World regions according to OWID'] || 'Unknown'
    });
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    try {
      await CountryData.insertMany(results);
      console.log('Data inserted successfully!');
    } catch (err) {
      console.error('Error inserting data:', err);
    } finally {
      mongoose.connection.close();
    }
  });
