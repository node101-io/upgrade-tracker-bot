const TYPE_LIST = ['regular_update', 'missed_update']

const secondsToHoursAndMinutes = seconds => {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);

  return hours + " saat " + minutes + " dakika";
};

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = (type, data, callback) => {
  if (!type || !TYPE_LIST.includes(type))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.chains || !Array.isArray(data.chains) || !data.chains.length)
    return callback('bad_request');

  if (type == 'regular_update') {
    let message = 'Ufukta güncelleme var! 🚀%0A%0A';
    data.chains.forEach(chain => {
      message += `⛓️ ${capitalizeFirstLetter(chain.identifier)} #${latest_update_id}%0A`;
      message += `📈 Anlık blok yüksekliği: ${chain.latest_block_height}, güncelleme blok yüksekliği: ${chain.latest_update_block_height}%0A`;
      message += `🕒 Güncellemeye yaklaşık ${secondsToHoursAndMinutes(chain.average_block_time * (chain.latest_update_block_height - chain.latest_block_height))} kaldı.%0A%0A`;
    });

    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${message}`)
      .then(res => res.json())
      .then(res => {
        if (!res.ok)
          return callback(res); // todo

        callback(null, res);
      })
      .catch(err => {
        callback(err);
      });
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
