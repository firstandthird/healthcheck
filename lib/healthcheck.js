const async = require('async');

exports.register = (server, options, next) => {
  const args = require('yargs').argv;
  const logPath = process.env.LOG_PATH || args.log;
  const configPath = process.env.CONFIG_PATH || args.config;
  if (!logPath || !configPath) {
    return next(new Error('log and config must be set'));
  }
  console.log(logPath, configPath);

  async.autoInject({
    db(done) {
      server.methods.init.db(logPath, done);
    },
    config(done) {
      server.methods.init.config(configPath, done);
    },
    expose(db, config, done) {
      server.expose('db', db);
      server.expose('config', config);
      done();
    },
    schedule(expose, done) {
      server.methods.init.schedule(done);
    },
    slack(expose, done) {
      server.methods.init.slack(done);
    }
  }, next);
};

exports.register.attributes = {
  pkg: require('../package.json')
};
