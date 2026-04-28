const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  runId: String,
  userTx: Object,
  exchangeTx: Object,
  status: String, // matched | conflicting | unmatched_user | unmatched_exchange
  reason: String
});

module.exports = mongoose.model('Match', matchSchema);