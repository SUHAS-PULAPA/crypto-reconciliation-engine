const reconcileService = require('../services/reconcileService');
const Match = require('../models/Match');
const { Parser } = require('json2csv');

exports.exportCSV = async (req, res) => {
  const data = await Match.find({ runId: req.params.runId });

  const formatted = data.map(d => ({
    status: d.status,
    reason: d.reason,
    userTx: JSON.stringify(d.userTx || {}),
    exchangeTx: JSON.stringify(d.exchangeTx || {})
  }));

  const parser = new Parser();
  const csv = parser.parse(formatted);

  res.header('Content-Type', 'text/csv');
  res.attachment('reconciliation_report.csv');
  return res.send(csv);
};

exports.runReconciliation = async (req, res) => {
  const config = {
    timestampTolerance: req.body.timestampTolerance || process.env.TIMESTAMP_TOLERANCE_SECONDS,
    quantityTolerance: req.body.quantityTolerance || process.env.QUANTITY_TOLERANCE_PCT
  };

  const runId = await reconcileService(config);

  res.json({ runId });
};

exports.getReport = async (req, res) => {
  const data = await Match.find({ runId: req.params.runId });
  res.json(data);
};

exports.getSummary = async (req, res) => {
  const data = await Match.find({ runId: req.params.runId });

  const summary = {
    matched: data.filter(d => d.status === 'matched').length,
    conflicting: data.filter(d => d.status === 'conflicting').length,
    unmatchedUser: data.filter(d => d.status === 'unmatched_user').length,
    unmatchedExchange: data.filter(d => d.status === 'unmatched_exchange').length
  };

  res.json(summary);
};

exports.getUnmatched = async (req, res) => {
  const data = await Match.find({
    runId: req.params.runId,
    status: { $in: ['unmatched_user', 'unmatched_exchange'] }
  });

  res.json(data);
};