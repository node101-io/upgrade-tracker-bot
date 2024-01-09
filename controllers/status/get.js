const Chain = require('../../models/chain/Chain');

module.exports = (req, res) => {
  Chain.findChainByIdentifierAndSetStatus(req.query.identifier, (err, chain) => {
    if (err) return res.redirect('/');

    return res.redirect('/');
  });
};