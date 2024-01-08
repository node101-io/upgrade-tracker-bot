const fetch = require('node-fetch');

module.exports = (identifier, callback) => {
  fetch(`https://raw.githubusercontent.com/cosmos/chain-registry/master/${identifier}/chain.json`)
    .then(res => res.json())
    .then(json => {
      const providers = json?.apis?.rest;

      if (providers) {
        const addresses = [];

        for (let i = 0; i < providers.length && i < 3; i++) {
          addresses.push(providers[i].address);
        };

        return callback(null, {
          success: true,
          urls: addresses,
        });
      };

      return callback(null, {
        success: false,
        urls: null,
      });
    })
    .catch(err => {
      return callback(err, {
        success: false,
        urls: null,
      });
    });
};
