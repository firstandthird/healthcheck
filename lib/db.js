const flatfile = require('flat-file-db');

exports.register = (server, options, next) => {
  const args = require('yargs').argv;
  const logPath = options.logPath || args.log;
  if (!logPath) {
    return next(new Error('log path must be specified either as env variable $LOG_PATH or with --log option'));
  }
  const db = flatfile(logPath);
  db.on('error', (e) => {
    server.log(['error'], e);
  });
  db.on('open', () => {
    server.expose('db', db);
    next();
  });
};

exports.register.attributes = {
  name: 'db'
};
