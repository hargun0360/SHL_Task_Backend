const express = require('express');
const app = express();
const techQueryRouter = require('./routes/techQuery');
const uploadRouter = require('./routes/upload.js')
const fetch = require('./routes/fetch');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());

app.use('/projects' , fetch);
app.use('/upload', uploadRouter);
app.use(bodyParser.json());

app.use('/ask-question', techQueryRouter);


// ... any other middlewares, error handlers etc.

module.exports = app;
