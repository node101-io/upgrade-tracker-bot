const cron = require('node-cron');

const autoUpdateAllChains = require('./functions/autoUpdateAllChains');
const checkForMissedUpdates = require('./functions/checkForMissedUpdates');
const sendHourlyMessage = require('./functions/sendHourlyMessage');

const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_SECOND_IN_MS = 1000;
const UPDATE_INTERVAL = 10 * ONE_SECOND_IN_MS;

let lastKillTime = null;

const autoUpdateAllChainsForOneMinute = startTime => {
  if (lastKillTime >= startTime)
    return;
  if (Date.now() - startTime >= ONE_MINUTE_IN_MS)
    return;

    autoUpdateAllChains(err => {
      if (err) console.error(`Cron Job Error at autoUpdateAllChains (${new Date}): ${err}`);

      setTimeout(() => autoUpdateAllChainsForOneMinute(startTime), UPDATE_INTERVAL);
    });
};

const Job = {
  start: callback => {
    const job_every_minute = cron.schedule('* * * * *', () => {
      console.log('Cron Job: ', new Date());

      autoUpdateAllChainsForOneMinute(Date.now());

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

    job_every_minute.start();
    job_every_hour.start();
    callback();
  }
};

module.exports = Job;