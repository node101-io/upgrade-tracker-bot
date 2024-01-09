const Chain = require('../../models/chain/Chain');

module.exports = (req, res) => {
  Chain.createChain(req.body, (err, chain) => {
    if (err) return res.redirect('/');

    return res.redirect('/');
  });
};