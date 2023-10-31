const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const sumUrl = 'http://sum:6002/sum';

app.use(express.json());

app.post('/calculate', (req, res) => {
  const input = req.body;
  // console.log('payload')
  if (!validateFileName(input.file)) {
    return res.json({
      file: null,
      error: 'Invalid JSON input.',
    });
  }

  if (!fileExists(input.file)) {
    return res.json({
      file: input.file,
      error: 'File not found.',
    });
  }

  axios
    .post(sumUrl, input)
    .then((response) => res.send(response.data))
    .catch((error) => res.status(500).send(error.message));
});

function validateFileName(fileName) {
  return fileName !== undefined && fileName !== null;
}

function fileExists(fileName) {
  // console.log(path.join(__dirname, fileName));
  // console.log('------')
  return fs.existsSync(path.join('/etc', fileName));
}

const port = 6000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
