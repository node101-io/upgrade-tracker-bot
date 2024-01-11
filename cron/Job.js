const cron = require('node-cron');

const autoUpdateAllChains = require('./functions/autoUpdateAllChains');
const checkForMissedUpdates = require('./functions/checkForMissedUpdates');
const sendHourlyMessage = require('./functions/sendHourlyMessage');
const sendTelegramMessage = require('../utils/sendTelegramMessage');

const Job = {
  start: callback => {
    const job_every_five_minute = cron.schedule('*/5 * * * *', () => {
      console.log('Cron Job: ', new Date());

      autoUpdateAllChains(err => {
        if (err) {
          console.error(`Cron Job Error at autoUpdateAllChains (${new Date}): ${err}`)

          sendTelegramMessage('error', {
            error: `Cron Job Error at autoUpdateAllChains (${new Date}): ${err}`
          }, _ => {});
        };
      });

      checkForMissedUpdates(err => {
        if (err) {
          console.error(`Cron Job Error at checkForMissedUpdates (${new Date}): ${err}`)

          sendTelegramMessage('error', {
            error: `Cron Job Error at checkForMissedUpdates (${new Date}): ${err}`
          }, _ => {});
        };
  
        return;
      });
    });

    const job_every_hour = cron.schedule('0 * * * *', () => {
      console.log('Cron Job: ', new Date());

      sendHourlyMessage(err => {
        if (err) {
          console.error(`Cron Job Error at sendHourlyMessage (${new Date}): ${err}`)

          sendTelegramMessage('error', {
            error: `Cron Job Error at sendHourlyMessage (${new Date}): ${err}`
          }, _ => {});
        };
  
        return;
      });
    });

    job_every_five_minute.start();
    job_every_hour.start();
    callback();
  }
};

module.exports = Job;