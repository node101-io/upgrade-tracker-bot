const Chain = require('../../models/chain/Chain');

module.exports = callback => {
  Chain.findChainsAndAutoUpdateAll((err, chains) => {
    if (err) return callback(err);

    callback(null);
  });
};