const fetch = require('node-fetch');

const fetchLatestBlockHeight = (url, callback) => {
  fetch(`${url}/cosmos/base/tendermint/v1beta1/blocks/latest`)
    .then(res => res.json())
    .then(json => {
      const height = json?.block?.header?.height;

      if (height)
        return callback(null, {
          success: true,
          height: height,
        });
      
      return callback(null, {
        success: false,
        height: null,
      });
    })
    .catch(err => {
      return callback(err, {
        success: false,
        height: null,
      });
    });
};

module.exports = (urls, callback) => {
  fetchLatestBlockHeight(data.urls[0], (err, result) => {
    if (err) return callback(err);
    if (result.success) return callback(null, result.height);

    fetchLatestBlockHeight(data.urls[1], (err, result) => {
      if (err) return callback(err);
      if (result.success) return callback(null, result.height);

      fetchLatestBlockHeight(data.urls[2], (err, result) => {
        if (err) return callback(err);
        if (result.success) return callback(null, result.height);

        return callback(null, null);
      });
    });
  });
};