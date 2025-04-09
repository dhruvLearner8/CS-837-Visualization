const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputFile = 'co2-emissions.csv'; // <-- Replace with your CSV file
const outputFile = 'final.csv'; // Output CSV

const rows = [];
const countryRegionMap = {}; // Mapping country -> region

// First pass: Read CSV and build country-region map
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Capture the country-region mapping if region is available
    if (row['World regions according to OWID']) {
      countryRegionMap[row['Entity']] = row['World regions according to OWID'];
    }
    rows.push(row); // Collect all rows
  })
  .on('end', () => {
    console.log('Country-Region Map:', countryRegionMap);

    // Second pass: Fill missing regions
    const updatedRows = rows.map(row => {
      return {
        ...row,
        'World regions according to OWID': row['World regions according to OWID'] || countryRegionMap[row['Entity']] || 'Unknown'
      };
    });

    // Prepare CSV writer
    const headers = Object.keys(rows[0]).map(key => ({ id: key, title: key }));
    const csvWriter = createCsvWriter({
      path: outputFile,
      header: headers
    });

    // Write updated CSV
    csvWriter.writeRecords(updatedRows)
      .then(() => console.log(`✅ Fixed CSV written to ${outputFile}`));
  });
