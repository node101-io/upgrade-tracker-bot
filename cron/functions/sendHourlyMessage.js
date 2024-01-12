const Chain = require('../../models/chain/Chain');

const sendTelegramMessage = require('../../utils/sendTelegramMessage');

module.exports = callback => {
  Chain.findChainsWithActiveUpdate((err, chains) => {
    if (err) return callback(err);

    if (!chains.length) {
      if (new Date(new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })).getHours() == 15)
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