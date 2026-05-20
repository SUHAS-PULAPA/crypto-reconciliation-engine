const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const routes = require('./routes/reconcileRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/', routes);
app.get('/', (req, res) => {
  res.send(`
🚀 Crypto Reconciliation Engine is running! <br><br>

Check the <a href="https://github.com/SUHAS-PULAPA/crypto-reconciliation-engine" target="_blank">
Readme for API Documentation
</a> <br><br>

For API Testing use 
<a href="https://www.postman.com/" target="_blank">
Postman Collection
</a>
`);
});

module.exports = app;