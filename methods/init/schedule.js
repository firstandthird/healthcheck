module.exports = {
  method(config, done) {
    const server = this;
    const scheduler = server.methods.methodScheduler.startSchedule;
    // if no schedules were specified in config then move on:
    if (!config.urls) {
      return done();
    }
    // register any schedules that were specified at start-up:
    config.urls.forEach(url => {
      // each https url warns if SSL certificate expires in next 7 days
      if (url.url.startsWith('https://')) {
        scheduler({
          label: `${url.name}.network.cert`,
          method: 'network.cert',
          time: 'every 24 hours',
          params: [{
            url: url.url
          }]
        });
      }
      const name = url.name || url.url;
      const time = url.interval || config.interval || 'every 5 minutes';
      const data = {
        label: url.name,
        method: 'checkurl',
        time: url.interval || config.interval || 'every 5 minutes',
        params: [{
          name: url.name || url.url,
          url: url.url,
          type: url.type || 'http',
          statusCode: url.statusCode || 200,
          responseThreshold: url.responseThreshold || config.responseThreshold || 1000,
          timeout: url.timeout || config.timeout || 10000,
          retryDelay: url.retryDelay || config.retryDelay || 1000,
          retryCount: url.retryCount || config.retryCount || 1,
          checkCount: 0
        }]
      };
      scheduler(data);
      server.log(['register'], {
        name,
        url: url.url,
        interval: time
      });
    });
    done();
  }
};
