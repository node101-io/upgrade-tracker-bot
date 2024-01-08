const fetch = require('node-fetch');

const fetchLatestBlockHeight = index => {
  fetch(`${urls[index]}/cosmos/base/tendermint/v1beta1/blocks/latest`)
    .then(res => res.json())
    .then(json => {
      const height = json?.block?.header?.height;

      if (height)
        return callback(null, height);

      if (index < urls.length - 1)
        return fetchLatestBlockHeight(index + 1);
    })
    .catch(err => {
      if (index < urls.length - 1)
        return fetchLatestBlockHeight(index + 1);

      return callback(err, null);
    });
};

module.exports = (urls, callback) => {
  fetchLatestBlockHeight(0);
};