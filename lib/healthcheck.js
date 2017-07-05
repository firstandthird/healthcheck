const async = require('async');

exports.register = (server, options, next) => {
  server.on('start', () => {
    const args = require('yargs').argv;
    const remoteConfig = process.env.CONFIG_URL || args.configUrl;
    let configPath = process.env.CONFIG_PATH || args.config;
    let isRemoteConfig = false;
    if (remoteConfig || process.env.RAPPTOR_CONFIG_URL) {
      configPath = remoteConfig;
      isRemoteConfig = true;
    }
    if (!configPath) {
      return next(new Error('config must be set'));
    }

    server.on('start', () => {
      server.log(['healthcheck', 'slack', 'start'], 'Healthcheck started');
    });

    async.autoInject({
      config(done) {
        server.methods.init.config(configPath, isRemoteConfig, done);
      },
      expose(config, done) {
        const pkg = require('../package.json');
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['User-Agent'] = config.headers['User-Agent'] || `${server.settings.app.ua}/${pkg.version}`;
        server.expose('config', config);
        done();
      },
      schedule(expose, config, done) {
        server.methods.init.schedule(config, done);
      },
      slack(expose, config, done) {
        server.methods.init.slack(config.slack, done);
      }
    });
  });
  next();
};

exports.register.attributes = {
  name: 'healthcheck'
};
