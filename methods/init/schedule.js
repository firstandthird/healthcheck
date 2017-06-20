module.exports = {
  method(config, done) {
    const server = this;
    const scheduler = server.settings.app.plugins['hapi-method-scheduler'].schedule;

    config.urls.forEach(url => {
      // each https url warns if SSL certificate expires in next 7 days
      if (url.url.startsWith('https://')) {
        const sslData = {
          method: 'network.cert',
          time: 'every 24 hours',
          params: [{
            url: url.url
          }]
        };
        scheduler.push(sslData);
      }
      const data = {
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
      scheduler.push(data);
      server.log(['healthcheck', 'register'], {
        name: data.params[0].name,
        url: data.params[0].url,
        interval: data.time
      });
    });

    done();
  }
};
