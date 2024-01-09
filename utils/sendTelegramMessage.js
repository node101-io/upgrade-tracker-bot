const TYPE_LIST = ['regular_update', 'missed_update']

module.exports = (type, data, callback) => {
  if (!type || !TYPE_LIST.includes(type))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (type == 'regular_update') {
    /*
      data = {
        chains: [
          getChain()'e bak
        ]
      }
    */
  } else if (type == 'missed_update') {
    /*
      data = {
        chains: [
          getChain()'e bak
        ]
      }

      FARK: Burada her chain ayrı bir mesaj. Mesajları Türkçe yazalım bence, dikkat çeksin özellikle bu hata mesajı. İlkinde emoji falan kullanabilirsin tatlı olur
    */
  } else {
    return callback('impossible_error');
  };
};