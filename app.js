const express = require('express');
const app = express();
const techQueryRouter = require('./routes/techQuery');
const uploadRouter = require('./routes/upload.js')
const bodyParser = require('body-parser');

app.use('/upload', uploadRouter);
app.use(bodyParser.json());

app.use('/ask-question', techQueryRouter);


app.get('/', function(req, res) {
    console.log("hello");
})

// ... any other middlewares, error handlers etc.

module.exports = app;
