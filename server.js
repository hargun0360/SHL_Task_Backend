require('dotenv').config();
const app = require('./app');
const express = require('express');
const connectDB = require('./config/db');

app.use(express.json())

connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));