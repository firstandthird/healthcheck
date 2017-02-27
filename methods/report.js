module.exports = {
  method(data, result) {
    const server = this;
    const db = server.plugins.healthcheck.db;
    const config = server.plugins.healthcheck.config;
    const results = db.get('results') || {};

    if (!results[data.name]) {
      results[data.name] = [];
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
      error: result.error
    };

    if (result.up) {
      tags.push('service-up');
    } else {
      tags.push('service-down');
    }

    server.log(tags, logData);
  }
};
