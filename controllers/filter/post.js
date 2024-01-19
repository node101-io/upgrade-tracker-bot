const Chain = require('../../models/chain/Chain');

module.exports = (req, res) => {
  Chain.findChainsByFilters(req.body, (err, chains_data) => {
    if (err) return res.json({ success: false, error: err });

    return res.json({
      success: true,
      chains_search: chains_data.search,
      chains: chains_data.chains
    });
  });
};