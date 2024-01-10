const cron = require('node-cron');

const autoUpdateAllChains = require('./functions/autoUpdateAllChains');
const checkForMissedUpdates = require('./functions/checkForMissedUpdates');
const sendHourlyMessage = require('./functions/sendHourlyMessage');

const Job = {
  start: callback => {
    const job_every_five_minute = cron.schedule('*/5 * * * *', () => {
      console.log('Cron Job: ', new Date());

      autoUpdateAllChains(err => {
        if (err) console.error(`Cron Job Error at autoUpdateAllChains (${new Date}): ${err}`);
      
        return;
      });

      checkForMissedUpdates(err => {
        if (err) console.error(`Cron Job Error at checkForMissedUpdates (${new Date}): ${err}`);
  
        return;
      });
    });

    const job_every_hour = cron.schedule('0 * * * *', () => {
      console.log('Cron Job: ', new Date());

      sendHourlyMessage(err => {
        if (err) console.error(`Cron Job Error at sendHourlyMessage (${new Date}): ${err}`);
  
        return;
      });
    });

    job_every_five_minute.start();
    job_every_hour.start();
    callback();
  }
};

module.exports = Job;