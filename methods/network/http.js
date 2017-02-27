const Wreck = require('wreck');

module.exports = {
  method(data) {
    const server = this;
    const start = Date.now();
    const config = server.plugins.healthcheck.config;

    Wreck.get(data.url, {
      timeout: data.responseThreshold,
      headers: config.headers
    }, (err, res, payload) => {
      let responseText = '';

      if (payload instanceof Buffer) {
        responseText = payload.toString();
      }

      const result = {
        timestamp: Date.now(),
        responseTime: Date.now() - start,
        error: null,
        up: false
      };

      if (err) {
        result.error = err;
      } else if (res.statusCode === data.statusCode) {
        result.up = true;
      } else {
        result.up = false;
        result.error = `Status code: ${res.statusCode}`;
      }

      if (result.up && data.containsText && responseText.indexOf(data.containsText) === -1) {
        result.up = false;
        result.error = 'Text not found';
      }

      server.methods.report(data, result);
    });
  }
};
