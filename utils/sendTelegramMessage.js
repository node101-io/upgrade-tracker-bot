const fetch = require('node-fetch');

const TYPE_LIST = ['error', 'missed_update', 'notify_alive', 'regular_update'];

const secondsToHoursAndMinutes = seconds => {
  return Math.floor(seconds / 3600) + " hours " + Math.floor((seconds % 3600) / 60) + " minutes";
};

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const sendMessage = (message, callback) => {
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
    .then(res => res.json())
    .then(res => {
      if (!res.ok)
        return callback('bad_request');

      return callback(null);
    })
    .catch(_ => {
      return callback('network_error');
    });
};

module.exports = (type, data, callback) => {
  if (!type || !TYPE_LIST.includes(type))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if ((type == 'regular_update' || type == 'missed_update') && (!data.chains || !Array.isArray(data.chains) || !data.chains.length))
    return callback('bad_request');

  let message = '';

  if (type == 'regular_update') {
    message += 'Updates on the horizon! 🚀';

    for (const chain of data.chains) {
      message += '\n\n' + `⛓️ ${capitalizeFirstLetter(chain.identifier)} | `;
      if (chain.mintscan_identifier)
        message += `[#${chain.latest_update_id}](https://www.mintscan.io/${chain.mintscan_identifier}/proposals/${chain.latest_update_id})\n`;
      else
        message += `#${chain.latest_update_id}\n`;
      message += `📈 Current block height: _${chain.latest_block_height}_, update block height: `;
      if (chain.mintscan_identifier)
        message += `[${chain.latest_update_block_height}](https://www.mintscan.io/${chain.mintscan_identifier}/block/${chain.latest_update_block_height})\n`;
      else
        message += `#${chain.latest_update_block_height}\n`;
      message += `🕒 Update time: _${new Date((chain.latest_update_block_height - chain.latest_block_height) * chain.average_block_time * 1000 + Date.now()).toLocaleString('en-US', { timeZone: process.env.TIMEZONE || 'Europe/Istanbul'})}_, `;
      message += `approximately _${secondsToHoursAndMinutes(chain.average_block_time * (chain.latest_update_block_height - chain.latest_block_height))}_ left.`;
    };
  } else if (type == 'missed_update') {
    for (const chain of data.chains)
      message += `🚨 Missed update for ${capitalizeFirstLetter(chain.identifier)} #${chain.latest_update_id}! 🚨\n`;
  } else if (type == 'error') {
    message += `Oh, another error: ${data.error}!\nCome on, let's fix this problem as soon as possible. Remember, we're in this together! 🤝`;
  } else if (type == 'notify_alive') {
    message += 'There are no updates for now, I just wanted to say good morning. 🌞';
  };

  sendMessage(message, err => {
    if (err)
      return callback(err);

    return callback(null);
  });
};
