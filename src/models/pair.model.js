const mongoose = require('mongoose');

let pairSchema = mongoose.Schema({
  pair: String,
  asset1: String,
  asset2: String,
  backTests: [Object],
});

// Export Image model
const Pair = mongoose.model('Pair', pairSchema);

module.exports = Pair;
