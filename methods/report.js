const moment = require('moment');

module.exports = {
  method: async function(data, result) {
    const server = this;
    const db = server.plugins.db.db;
    const config = server.settings.app;
    const results = db.get('results') || {};
    const status = db.get('status') || {};

    if (!results[data.name]) {
      results[data.name] = [];
    }

    if (!status[data.name]) {
      status[data.name] = {};
    }

    if (results[data.name].length >= config.maxEntries) {
      results[data.name].shift();
    }

    result.error = (result.error) ? result.error.toString() : null;
    results[data.name].push(result);

    db.put('results', results);

    const tags = ['service-check', data.name];

    const logData = {
      type: data.type,
      name: data.name,
      url: data.url,
      responseTime: result.responseTime,
      error: result.error,
      retries: data.checkCount || 0
    };
    if (data.type === 'certification') {
      tags.push('certificate-expiration');
    }
    if (!result.up) {
      if (status[data.name].up !== false) {
        status[data.name] = {
          up: false,
          downSince: Date.now()
        };

        db.put('status', status);
      }
      if (data.type !== 'certification') {
        tags.push('service-down');
      }
      if (data.type === 'certification') {
        logData.message = `The SSL certificate for ${data.url} expires in ${(result.expiresIn / (1000 * 60 * 60 * 24)).toFixed(2)} days `;
      } else {
        logData.message = `${data.name} is down`;
      }
    } else if (result.slow) {
      tags.push('service-slow');
    } else {
      const wasDown = (status[data.name].up === false);

      if (wasDown) {
        logData.downSince = status[data.name].downSince;
        logData.downFor = moment(logData.downSince).toNow(true);
        logData.message = `${data.name} is back up after ${logData.downFor}`;
        delete status[data.name];
        db.put('status', status);
        tags.push('service-restored');
      }
    }
    if (tags.length > 2 || config.verbose) {
      server.log(tags, logData);
    }
  }
};
