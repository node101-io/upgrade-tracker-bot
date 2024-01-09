const fetch = require('node-fetch');

const fetchLatestBlockHeight = (index, rest_api_list, callback) => {
  fetch(`${rest_api_list[index]}/cosmos/base/tendermint/v1beta1/blocks/latest`)
    .then(res => res.json())
    .then(json => {
      const height = json?.block?.header?.height;

      if (height)
        return callback(null, height);

      if (index < rest_api_list.length - 1)
        return fetchLatestBlockHeight(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    })
    .catch(_ => {
      if (index < rest_api_list.length - 1)
        return fetchLatestBlockHeight(index + 1, rest_api_list, callback);

      return callback('fetch_error', null);
    });
};

module.exports = (data, callback) => {
  return fetchLatestBlockHeight(0, data.rest_api_list, callback);
};
