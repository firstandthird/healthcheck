const ping = require('ping');

module.exports = {
  async method(data) {
    const server = this;

    const res = await ping.promise.probe(data.url, { timeout: data.timeout / 1000 });
    const result = {
      timestamp: Date.now(),
      up: res.alive,
      responseTime: res.time * 1000,
      error: null,
      slow: false
    };

    if (!result.up) {
      result.up = false;
      result.error = 'No Response';
    } else if (res.time * 1000 > data.responseThreshold) {
      result.slow = true;
      result.error = 'Response Threshold';
    }

    if ((!result.up || result.slow) && data.checkCount < data.retryCount) {
      return setTimeout(() => {
        data.checkCount++;
        server.methods.network.ping(data);
      }, data.retryDelay);
    }

    server.methods.report(data, result);
    data.checkCount = 0; // Reset
  }
};
