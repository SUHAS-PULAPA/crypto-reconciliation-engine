const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const routes = require('./routes/reconcileRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/', routes);
app.get('/', (req, res) => {
  res.send('🚀 Crypto Reconciliation Engine is running!');
});

module.exports = app;