module.exports = {
  method(config, done) {
    const server = this;
    const scheduler = server.methods.methodScheduler.startSchedule;

    config.urls.forEach(url => {
      // each https url warns if SSL certificate expires in next 7 days
      if (url.url.startsWith('https://')) {
        scheduler({
          method: `network.cert('${url.url}')`,
          time: 'every 24 hours',
        });
      }
      const name = url.name || url.url;
      const time = url.interval || config.interval || 'every 5 minutes';
      const data = {
        name: url.name || url.url,
        url: url.url,
        type: url.type || 'http',
        statusCode: url.statusCode || 200,
        responseThreshold: url.responseThreshold || config.responseThreshold || 1000,
        timeout: url.timeout || config.timeout || 10000,
        retryDelay: url.retryDelay || config.retryDelay || 1000,
        retryCount: url.retryCount || config.retryCount || 1,
        checkCount: 0
      };
      const string = `checkurl(${JSON.stringify(data)})`;
      scheduler({
        method: string,
        time: url.interval || config.interval || 'every 5 minutes',
      });
      server.log(['healthcheck', 'register'], {
        name,
        url: url.url,
        interval: time
      });
    });
    done();
  }
};
