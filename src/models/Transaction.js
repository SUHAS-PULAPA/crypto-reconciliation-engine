const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  source: { type: String, enum: ['user', 'exchange'] },
  externalId: String,
  timestamp: Date,
  type: String,
  asset: String,
  quantity: Number,
  raw: Object, // store original row
  validationErrors: [String],
  isValid: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);