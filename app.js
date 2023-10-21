const express = require('express');
const app = express();
const techQueryRouter = require('./routes/techQuery');
const uploadRouter = require('./routes/upload.js')

app.use('/ask-question', techQueryRouter);
app.use('/upload', uploadRouter);

// ... any other middlewares, error handlers etc.

module.exports = app;
