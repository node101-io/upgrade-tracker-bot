const Chain = require('../../models/chain/Chain');

const sendTelegramMessage = require('../../utils/sendTelegramMessage');

module.exports = callback => {
  Chain.findChainsWithActiveUpdate((err, chains) => {
    if (err) return callback(err);

    if (!chains.length) return callback(null);

    sendTelegramMessage('regular_update', { chains }, err => {
      if (err) return callback(err);

      callback(null);
    });
  });
};