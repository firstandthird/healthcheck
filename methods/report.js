module.exports = {
  method(data, result) {
    const server = this;
    const db = server.plugins.healthcheck.db;
    const config = server.plugins.healthcheck.config;
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

    results[data.name].push(result);

    db.put('results', results);

    const tags = ['healthcheck'];

    const logData = {
      type: data.type,
      name: data.name,
      responseTime: result.responseTime,
      error: result.error,
      retries: data.checkCount || 0
    };

    if (!result.up) {
      if (status[data.name].up !== false) {
        status[data.name] = {
          up: false,
          downSince: Date.now()
        };

        db.put('status', status);

        tags.push('service-down');
      } else {
        return;
      }
    } else if (result.slow) {
      tags.push('service-slow');
    } else {
      const wasDown = (status[data.name].up === false);

      if (!wasDown && !config.verbose) {
        return;
      }

      if (wasDown) {
        logData.downSince = status[data.name].downSince;
        delete status[data.name];
        db.put('status', status);
      }

      tags.push('service-up');
    }

    server.log(tags, logData);
  }
};
