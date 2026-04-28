const express = require('express');
const router = express.Router();
const reconcile = require('../services/reconcileService');
const Match = require('../models/Match');
const controller = require('../controllers/reconcileController');

router.post('/reconcile', async (req, res) => {
  const config = {
    timestampTolerance: req.body.timestampTolerance || 300,
    quantityTolerance: req.body.quantityTolerance || 0.01
  };

  const runId = await reconcile(config);
  res.json({ runId });
});

router.get('/report/:runId', async (req, res) => {
  const data = await Match.find({ runId: req.params.runId });
  res.json(data);
});

router.get('/report/:runId/summary', async (req, res) => {
  const data = await Match.find({ runId: req.params.runId });
  const total = data.length;
    const countMatched = data.filter(d => d.status === 'matched').length;
    const countConflicting = data.filter(d => d.status === 'conflicting').length;
    const countUser = data.filter(d => d.status === 'unmatched_user').length;
    const countExchange = data.filter(d => d.status === 'unmatched_exchange').length;
    const summary = {
    matched: countMatched,
    conflicting: countConflicting,
    unmatchedUser: countUser,
    unmatchedExchange: countExchange,
    matchRate: ((countMatched / total) * 100).toFixed(2) + '%'
    };

  res.json(summary);
});

router.get('/report/:runId/unmatched', async (req, res) => {
  const data = await Match.find({
    runId: req.params.runId,
    status: { $in: ['unmatched_user', 'unmatched_exchange'] }
  });

  res.json(data);
});

router.get('/report/:runId/export', controller.exportCSV);

module.exports = router;