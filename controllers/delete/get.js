const Chain = require('../../models/chain/Chain');

module.exports = (req, res) => {
  Chain.findChainByIdentifierAndDelete(req.query.identifier, err => {
    if (err) return res.redirect('/');

    return res.redirect('/');
  });
};