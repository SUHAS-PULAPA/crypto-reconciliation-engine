const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  runId: String,
  config: Object,
  summary: {
    matched: Number,
    conflicting: Number,
    unmatchedUser: Number,
    unmatchedExchange: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('ReconciliationRun', runSchema);