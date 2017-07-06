const async = require('async');

exports.register = (server, options, next) => {
  server.on('start', () => {
    server.log(['healthcheck', 'slack', 'start'], 'Healthcheck started');
    const config = server.settings.app;
    async.autoInject({
      headers(done) {
        const pkg = require('../package.json');
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['User-Agent'] = config.headers['User-Agent'] || `${server.settings.app.ua}/${pkg.version}`;
        done();
      },
      schedule(headers, done) {
        server.methods.init.schedule(config, done);
      },
      slack(headers, done) {
        server.methods.init.slack(config.slack, done);
      }
    });
  });
  next();
};

exports.register.attributes = {
  name: 'healthcheck'
};
