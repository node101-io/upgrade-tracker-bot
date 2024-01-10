const fetch = require('node-fetch');

const TYPE_LIST = ['error', 'regular_update', 'missed_update'];

const secondsToHoursAndMinutes = seconds => {
  return Math.floor(seconds / 3600) + " saat " + Math.floor((seconds % 3600) / 60) + " dakika";
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

  if (type == 'error') {
    const message = 'Ah, yine bir hata! Bak, böyle devam ederse ikimiz de hiç ilerleyemeyiz. Hadi, bir an önce bu sorunu çözelim. Unutma, her hatada beraberiz. Hata aldığımız URL\'ler:\n' + data.rest_api_list.join(',\n');

    process.env.DEVS_TELEGRAM_CHAT_ID_LIST.split(',').forEach(chat_id => {
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${chat_id}&text=${encodeURIComponent(message)}`)
        .then(res => res.json())
        .then(res => {
          if (!res.ok)
            return callback('bad_request');

          return callback(null);
        })
        .catch(_ => {
          return callback('network_error');
        });
    });
  } else if (type == 'regular_update') {
    let message = 'Ufukta güncelleme var! 🚀';

    for (const chain of data.chains) {
      message += '\n\n' +
        `⛓️ ${capitalizeFirstLetter(chain.identifier)} #${chain.latest_update_id}\n` +
        `📈 Anlık blok yüksekliği: ${chain.latest_block_height}, güncelleme blok yüksekliği: ${chain.latest_update_block_height}\n` +
        `🕒 Güncellemeye yaklaşık ${secondsToHoursAndMinutes(chain.average_block_time * (chain.latest_update_block_height - chain.latest_block_height))} kaldı.`;
    };

    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`)
      .then(res => res.json())
      .then(res => {
        if (!res.ok)
          return callback('bad_request');

        return callback(null);
      })
      .catch(_ => {
        return callback('network_error');
      });
  } else if (type == 'missed_update') {
    data.chains.forEach(chain => {
      const message = `🚨 ${capitalizeFirstLetter(chain.identifier)} #${chain.latest_update_id} güncellemesi kaçırıldı! 🚨`;

      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`)
        .then(res => res.json())
        .then(res => {
          if (!res.ok)
            return callback('bad_request');

          return callback(null);
        })
        .catch(_ => {
          return callback('network_error');
        });
    });
  };
};
