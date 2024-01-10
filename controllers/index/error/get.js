const sendTelegramMessage = require('../../../utils/sendTelegramMessage');

module.exports = (req, res) => {
  const error = req.query.message ? req.query.message : 'unknown_error';

  if (!error.includes('no_log'))
    sendTelegramMessage('error', {
      error: req.query.message ? req.query.message : 'unknown_error'
    }, _ => {});

  return res.json({ error });
};
