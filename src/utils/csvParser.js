const fs = require('fs');
const csv = require('csv-parser');
const Transaction = require('../models/Transaction');

function parseDate(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

async function parseCSV(filePath, source) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const validationErrors = [];

        // ✅ Safe parsing
        const timestamp = parseDate(row.timestamp);
        const quantity = parseFloat(row.quantity);

        if (!timestamp) {
          validationErrors.push("Invalid timestamp");
        }

        if (isNaN(quantity)) {
          validationErrors.push("Invalid quantity");
        }

        const tx = {
          source,
          externalId: row.id || null,
          timestamp: timestamp || new Date(), // fallback to avoid crash
          type: row.type?.toUpperCase(),
          asset: row.asset?.toUpperCase(),
          quantity: quantity || 0,
          raw: row,
          validationErrors,
          isValid: validationErrors.length === 0
        };

        results.push(tx);
      })
      .on('end', async () => {
        try {
          await Transaction.insertMany(results, { ordered: false });
          resolve(results);
        } catch (err) {
          console.error("⚠️ Some records failed to insert, continuing...");
          resolve(results);
        }
      })
      .on('error', reject);
  });
}

module.exports = parseCSV;