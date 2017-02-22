const ping = require('ping')

module.exports = {
  method(data) {
    const server = this;
    
    ping.promise.probe(data.url, {
      timeout: 10,
      extra: ['-c 1']
    }).then(res => {
      let isAlive = res.alive;
      let error = null;
      
      if (!isAlive || res.time * 1000 > data.responseThreshold) {
        isAlive = false;
        error = 'Response threshold';
      }
      
      const result = {
        timestamp: Date.now(),
        up: res.alive,
        responseTime: res.time * 1000,
        error
      };
      
      server.methods.report(data, result);
    });
  }
};