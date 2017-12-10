module.exports = {
  method(config) {
    const server = this;
    const scheduler = server.methods.methodScheduler.startSchedule;
    // if no schedules were specified in config then move on:
    if (!config.urls) {
      return;
    }
    // register any schedules that were specified at start-up:
    config.urls.forEach(url => {
      // each https url should implicitly do a cert check.
      // cert check will warn if SSL certificate expires in next 7 days
      if (url.url.startsWith('https://')) {
        scheduler({
          label: `${url.name}.network.cert`,
          method: 'network.cert',
          time: 'every 24 hours',
          params: [{
            name: `${url.name || url.url}.network.cert`,
            url: url.url,
            // can specify how close to expiration to consider a 'warning' range:
            expireLimit: url.expireLimit ? url.expireLimit : 1000 * 60 * 60 * 24 * 7,
          }]
        });
      }
      const name = url.name || url.url;
      const time = url.interval || config.interval || 'every 5 minutes';
      // status codes will be returned as number so convert it if it is a string:
      if (typeof url.statusCode === 'string') {
        url.statusCode = parseInt(url.statusCode, 10);
      }
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
          // if type is 'cert' it needs an expire limit:
          expireLimit: url.expireLimit ? url.expireLimit : 1000 * 60 * 60 * 24 * 7,
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
  }
};
