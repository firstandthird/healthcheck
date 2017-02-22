module.exports = {
  method(done) {
    const server = this;
    const scheduler = this.settings.app.plugins['hapi-method-scheduler'].schedule;
    const config = server.plugins.healthcheck.config;

    console.log(this.settings.app.plugins['hapi-method-scheduler']);

    config.urls.forEach(url => {
      scheduler.push({
        method: 'checkurl',
        time: url.interval || config.interval || 'every 5 minutes',
        params: [{
          name: url.name || url.url,
          url: url.url,
          type: url.type || 'http',
          statusCode: url.statusCode || 200,
          responseThreshold: url.responseThreshold || config.responseThreshold || 1000
        }]
      });
    });

    done();
  }
};
