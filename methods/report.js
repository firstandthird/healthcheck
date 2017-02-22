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

    if (result.up) {
      server.log(['service-up', 'healthcheck'], `${data.type} | ${data.name} - ${result.responseTime}ms`);
    } else {
      server.log(['service-down', 'healthcheck'], `${data.type} | ${data.name} - ${result.responseTime}ms - status ${result.error}`);
    }
  }
};
