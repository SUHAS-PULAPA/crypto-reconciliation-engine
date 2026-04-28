const Transaction = require('../models/Transaction');
const Match = require('../models/Match');
const { v4: uuidv4 } = require('uuid');
const {
  normalizeType,
  isWithinTolerance,
  normalizeAsset
} = require('./matchingService');
const parseCSV = require('../utils/csvParser');

async function reconcile(config) {
  const runId = uuidv4();

  console.log("⚙️ Running reconciliation with config:", config);

  // ✅ STEP 1: Clear old data
  await Transaction.deleteMany({});
  await Match.deleteMany({});

  // ✅ STEP 2: Ingest CSV
  console.log("📥 Ingesting CSV data...");

  await parseCSV('./data/user_transactions.csv', 'user');
  await parseCSV('./data/exchange_transactions.csv', 'exchange');

  console.log("✅ CSV ingestion complete");

  // ✅ STEP 3: Fetch valid transactions
  const userTxs = await Transaction.find({ source: 'user', isValid: true });
  const exTxs = await Transaction.find({ source: 'exchange', isValid: true });

  console.log(`📊 User TX: ${userTxs.length}, Exchange TX: ${exTxs.length}`);

  const usedExchange = new Set();
  let results = [];

  // ✅ STEP 4: Matching
  for (let u of userTxs) {
    let bestMatch = null;
    let bestScore = Infinity;

    for (let e of exTxs) {
      if (usedExchange.has(e._id.toString())) continue;

      const userAsset = normalizeAsset(u.asset);
      const exchangeAsset = normalizeAsset(e.asset);

      const userType = normalizeType(u.type, 'user');
      const exchangeType = e.type;

      if (userAsset === exchangeAsset && userType === exchangeType) {
        const timeDiff = Math.abs(new Date(u.timestamp) - new Date(e.timestamp));
        const qtyDiff = Math.abs(u.quantity - e.quantity);

        const score = timeDiff + qtyDiff;

        if (score < bestScore) {
          bestScore = score;
          bestMatch = e;
        }
      }
    }

    // ✅ STEP 5: Categorize result
    if (bestMatch) {
      const timeDiff = Math.abs(new Date(u.timestamp) - new Date(bestMatch.timestamp));
      const qtyDiff = Math.abs(u.quantity - bestMatch.quantity);

      if (isWithinTolerance(u, bestMatch, config)) {
        results.push({
          runId,
          userTx: u,
          exchangeTx: bestMatch,
          status: 'matched',
          reason: `Best match | Time diff: ${timeDiff}ms | Qty diff: ${qtyDiff}`
        });
      } else {
        results.push({
          runId,
          userTx: u,
          exchangeTx: bestMatch,
          status: 'conflicting',
          reason: `Outside tolerance | Time diff: ${timeDiff}ms | Qty diff: ${qtyDiff}`
        });
      }

      usedExchange.add(bestMatch._id.toString());
    } else {
      results.push({
        runId,
        userTx: u,
        status: 'unmatched_user',
        reason: 'No suitable match found'
      });
    }
  }

  // ✅ STEP 6: Remaining exchange unmatched
  for (let e of exTxs) {
    if (!usedExchange.has(e._id.toString())) {
      results.push({
        runId,
        exchangeTx: e,
        status: 'unmatched_exchange',
        reason: 'No matching user transaction'
      });
    }
  }

  // ✅ STEP 7: Save results
  await Match.insertMany(results);

  console.log("✅ Reconciliation complete");

  return runId;
}

module.exports = reconcile;