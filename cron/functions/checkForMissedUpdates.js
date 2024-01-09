const Chain = require('../../models/chain/Chain');

const sendTelegramMessage = require('../../utils/sendTelegramMessage');

module.exports = callback => {
  Chain.findChainsWithMissedUpdateAndUpdateLastPingTime((err, chains) => {
    if (err) return callback(err);

    if (!chains.length) return callback(null);

    sendTelegramMessage('missed_update', { chains }, err => {
      if (err) return callback(err);

      callback(null);
    });
  });
};