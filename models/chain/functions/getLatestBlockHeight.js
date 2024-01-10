const fetch = require('node-fetch');

const fetchLatestBlockHeight = (index, rest_api_list, callback) => {
  fetch(`${rest_api_list[index]}/cosmos/base/tendermint/v1beta1/blocks/latest`)
    .then(res => res.json())
    .then(json => {
      const height = json.block?.header?.height;

      if (height)
        return callback(null, height);

      if (index < rest_api_list.length - 1)
        return fetchLatestBlockHeight(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    })
    .catch(_ => {
      if (index < rest_api_list.length - 1)
        return fetchLatestBlockHeight(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    });
};

module.exports = (rest_api_list, callback) => {
  const random_index = Math.floor(Math.random() * rest_api_list.length);
  rest_api_list = rest_api_list.slice(random_index).concat(rest_api_list.slice(0, random_index));

  fetchLatestBlockHeight(0, rest_api_list, (err, height) => {
    if (err)
      return callback(err);

    return callback(null, height);
  });
};
