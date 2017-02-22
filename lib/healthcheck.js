const async = require('async');

exports.register = (server, options, next) => {
  const args = require('yargs').argv;

  async.autoInject({
    db(done) {
      server.methods.init.db(args.log, done);
    },
    config(done) {
      server.methods.init.config(args.config, done);
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
