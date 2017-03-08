const async = require('async');

exports.register = (server, options, next) => {
  const args = require('yargs').argv;
  const logPath = process.env.LOG_PATH || args.log;
  const remoteConfig = process.env.CONFIG_URL || args.configUrl;
  let configPath = process.env.CONFIG_PATH || args.config;
  let isRemoteConfig = false;

  if (remoteConfig) {
    configPath = remoteConfig;
    isRemoteConfig = true;
  }

  if (!logPath || !configPath) {
    return next(new Error('log and config must be set'));
  }

  async.autoInject({
    db(done) {
      server.methods.init.db(logPath, done);
    },
    config(done) {
      server.methods.init.config(configPath, isRemoteConfig, done);
    },
    expose(db, config, done) {
      const pkg = require('../package.json');

      if (!config.headers) {
        config.headers = {};
      }

      config.headers['User-Agent'] = config.headers['User-Agent'] || `${server.settings.app.ua}/${pkg.version}`;

      server.expose('configPath', configPath);
      server.expose('isRemoteConfig', isRemoteConfig);
      server.expose('db', db);
      server.expose('config', config);
      done();
    },
    schedule(expose, config, done) {
      server.methods.init.schedule(config, done);
    },
    slack(expose, config, done) {
      server.methods.init.slack(config.slack, done);
    }
  }, next);
};

exports.register.attributes = {
  name: 'healthcheck'
};
