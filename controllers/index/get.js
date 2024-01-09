const Chain = require('../../models/Chain');

module.exports = (req, res) => {
  Chain.findChains((err, chains) => {
    if (err) return res.redirect('/login');

    return res.render('index/index', {
      page: 'index/index',
      title: 'Dashboard',
      includes: {
        external: {
          css: ['general', 'page'],
          js: []
        }
      },
      chains
    });
  });
};