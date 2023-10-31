const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const sum = 'http://35.192.144.148:80/sum';

//container1 functions here.

app.use(express.json());

app.post('/store-file', (req, res) => {
  const input = req.body;

  if (!validateStoreRequest(input)) {
    return res.json({
      file: null,
      error: 'Invalid JSON input.',
    });
  }

  const fileData = input.data.split('\n').join('\n');;

  fs.writeFile(path.join('/etc/', input.file), fileData, (err) => {
    if (err) {
      console.error(err);
      return res.json({
        file: input.file,
        error: 'Error while storing the file to the storage.',
      });
    }
    return res.json({
      file: input.file,
      message: 'Success.',
    });
  });
});

app.post('/calculate', (req, res) => {
  const input = req.body;

  if (!validateCalculateRequest(input)) {
    return res.json({
      file: null,
      error: 'Invalid JSON input.',
    });
  }

  if (!fileExist(input.file)) {
    return res.json({
      file: input.file,
      error: "File not found.",
    });
  }

  axios
    .post(`${sum}`, input)
    .then((response) => res.send(response.data))
    .catch((error) => res.status(500).send(error.message));
});

function validateStoreRequest(input) {
  return input.file !== undefined && input.file !== null && input.data !== undefined && input.data !== null;
}

function validateCalculateRequest(input) {
  return input.file !== undefined && input.file !== null && input.product !== undefined && input.product !== null;
}

const fileExist = (fileName) => {
  return fs.existsSync(path.join("/etc", fileName));
};

const port = 7777;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
