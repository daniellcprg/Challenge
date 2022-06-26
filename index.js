const express = require('express');
const dotenv = require('dotenv');

const LogParser = require('./LogParser');

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const logParser = new LogParser();

  const games = logParser.execute();

  return res.json(games)
});

app.get('/:id', (req, res) => {
  const { id } = req.params;

  const logParser = new LogParser();

  const games = logParser.execute();

  return res.json(games[id])
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
