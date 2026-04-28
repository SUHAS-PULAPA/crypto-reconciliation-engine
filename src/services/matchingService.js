function normalizeType(type, source) {
  const map = {
    TRANSFER_IN: source === 'user' ? 'TRANSFER_OUT' : 'TRANSFER_IN',
    TRANSFER_OUT: source === 'user' ? 'TRANSFER_IN' : 'TRANSFER_OUT'
  };
  return map[type] || type;
}

function isWithinTolerance(userTx, exTx, config) {
  const timeDiff = Math.abs(userTx.timestamp - exTx.timestamp) / 1000;
  const qtyDiffPct = Math.abs(userTx.quantity - exTx.quantity) / exTx.quantity * 100;

  return (
    timeDiff <= config.timestampTolerance &&
    qtyDiffPct <= config.quantityTolerance
  );
}

const assetMap = {
  BTC: 'BTC',
  BITCOIN: 'BTC',
  ETH: 'ETH',
  ETHEREUM: 'ETH'
};

function normalizeAsset(asset) {
  return assetMap[asset?.toUpperCase()] || asset?.toUpperCase();
}

module.exports = { normalizeType, isWithinTolerance, normalizeAsset };