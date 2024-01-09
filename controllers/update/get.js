const Chain = require('../../models/chain/Chain');

module.exports = (req, res) => {
  Chain.findChainByIdentifierAndFormat(req.query.identifier, (err, chain) => {
    if (err) return res.redirect('/');

    return res.render('update/index', {
      page: 'update/index',
      title: `${chain.identifer} - Update Chain`,
      includes: {
        external: {
          css: ['form', 'general', 'page', 'text'],
          js: []
        }
      },
      chain
    });
  })
}