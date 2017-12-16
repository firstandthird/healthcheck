const async = require('async');

const register = (server, options) => {
  server.events.on('start', () => {
    const config = server.settings.app;
    async.autoInject({
      headers(done) {
        const pkg = require('../package.json');
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['User-Agent'] = config.headers['User-Agent'] || `${config.userAgent} ${server.settings.app.ua}/${pkg.version}`;
        done();
      },
      schedule(headers, done) {
        server.methods.init.schedule(config, done);
      }
    });
  });
};

exports.plugin = {
  register,
  once: true,
  pkg: require('../package.json')
};
