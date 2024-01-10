const fetch = require('node-fetch');

module.exports = (identifier, callback) => {
  fetch(`https://raw.githubusercontent.com/cosmos/chain-registry/master/${identifier}/chain.json`)
    .then(res => res.json())
    .then(json => {
      const providers = json?.apis?.rest;

      const rest_api_list = [];

      for (let i = 0; i < providers?.length && i < 3; i++)
        rest_api_list.push(providers[i].address);

      if (!rest_api_list)
        return callback('document_not_found', null);

      return callback(null, rest_api_list);
    })
    .catch(_ => {
      return callback('document_not_found', null);
    });
};
