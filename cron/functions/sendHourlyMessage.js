const Chain = require('../../models/chain/Chain');

const sendTelegramMessage = require('../../utils/sendTelegramMessage');

const timeZoneOffset = +3; // UTC+3 Turkey

module.exports = callback => {
  Chain.findChainsWithActiveUpdate((err, chains) => {
    if (err) return callback(err);

    if (!chains.length) {
      if (new Date().getHours() == 9 + timeZoneOffset)
        sendTelegramMessage('notify_alive', {}, err => {
          if (err) return callback(err);

          return callback(null);
        });

      return callback(null);
    };

    sendTelegramMessage('regular_update', { chains }, err => {
      if (err) return callback(err);

      callback(null);
    });
  });
};