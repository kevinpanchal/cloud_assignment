const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());

app.post('/sum', (req, res) => {
  const payload = req.body;
  const fileName = payload.file;

  const errorResponse = {
    file: fileName,
    error: 'Input file not in CSV format.',
  };

  fs.readFile(path.join('/etc', fileName), {encoding: 'utf-8'}, (err, data) => {
    if (err) {
      console.log(err.message)
      return res.json(errorResponse);
    }

    const lines = data.split('\n');

    const columnNames = lines[0].split(',').map((columnName) => columnName.trim());

    if (columnNames.length !== 2 || columnNames[0].toLowerCase() !== 'product' || columnNames[1].toLowerCase() !== 'amount') {
      return res.json(errorResponse);
    }

    let sum = 0;

    for (let i = 1; i < lines.length; i++) {
      const pair = lines[i].split(',').map((value) => value.trim());

      if (pair.length !== 2) {
        return res.json(errorResponse);
      }

      const [product, amount] = pair;

      if (product.toLowerCase() === payload.product.toLowerCase()) {
        sum += parseInt(amount, 10);
      }
    }

    return res.json({
      file: fileName,
      sum: sum,
    });
  });
});

const port = 6002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
