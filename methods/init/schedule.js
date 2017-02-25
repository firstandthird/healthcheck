module.exports = {
  method(config, done) {
    const server = this;
    const scheduler = server.settings.app.plugins['hapi-method-scheduler'].schedule;

    config.urls.forEach(url => {
      const data = {
        method: 'checkurl',
        time: url.interval || config.interval || 'every 5 minutes',
        params: [{
          name: url.name || url.url,
          url: url.url,
          type: url.type || 'http',
          statusCode: url.statusCode || 200,
          responseThreshold: url.responseThreshold || config.responseThreshold || 1000
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
