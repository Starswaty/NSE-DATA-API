const express = require('express');
const { NseIndia } = require('stock-nse-india');
const cors = require('cors');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const nseIndia = new NseIndia();

app.use(cors());

// Home route
app.get('/', (req, res) => {
  res.send('✅ NSE Stock API Server is running. Use /historical/:symbol to get data.');
});

// Historical data route
app.get('/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-05-05');

  try {
    const data = await nseIndia.getEquityHistoricalData(symbol.toUpperCase(), {
      start: startDate,
      end: endDate,
    });

    if (data && data.length > 0) {
      // Respond with JSON data
      res.json(data);

      // Save the CSV file
      const parser = new Parser();
      const csv = parser.parse(data);

      // Ensure the "data" directory exists
      const filePath = path.join(__dirname, 'data');
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }

      const filename = `${symbol.toUpperCase()}_historical_data.csv`;

      // Save the CSV data to a file
      fs.writeFileSync(path.join(filePath, filename), csv);
      console.log(`✅ CSV saved to data/${filename}`);
    } else {
      res.status(404).send('❌ No data found for this symbol or date range.');
    }
  } catch (error) {
    res.status(500).send(`❌ Error fetching data: ${error.message}`);
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
