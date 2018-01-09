const Wreck = require('wreck');

module.exports = {
  async method(data) {
    const server = this;
    const start = Date.now();
    const config = server.settings.app;
    const result = {
      timestamp: Date.now(),
      responseTime: Date.now() - start,
      error: null,
      up: false,
      slow: false
    };

    try {
      const { res, payload } = await Wreck.get(data.url, {
        timeout: data.timeout,
        headers: config.headers
      });
      const responseText = payload instanceof Buffer ? payload.toString() : '';
      if (res.statusCode === data.statusCode) {
        result.up = true;
      } else {
        result.up = false;
        result.error = `Status code: ${res.statusCode}`;
      }
      if (result.up && data.containsText && responseText.indexOf(data.containsText) === -1) {
        result.up = false;
        result.error = 'Text not found';
      }
      if (result.responseTime > data.responseThreshold) {
        result.slow = true;
        result.error = 'Response threshold';
      }
    } catch (err) {
      // see if it was an error we were expecting anyway:
      if (err.output && err.output.statusCode === data.statusCode) {
        result.up = true;
      } else {
        result.error = err;
      }
    } finally {
      // only report after we've re-tried the specified number of times:
      if ((!result.up || result.slow) && data.checkCount < data.retryCount) {
        data.checkCount++;
        return setTimeout(() => {
          server.methods.network.http(data);
        }, data.retryDelay);
      }
      await server.methods.report(data, result);
      data.checkCount = 0; // Reset after reporting
    }
  }
};
