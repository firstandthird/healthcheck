const flatfile = require('flat-file-db');

exports.register = (server, options, next) => {
  const args = require('yargs').argv;
  const logPath = process.env.LOG_PATH || args.log;
  if (!logPath) {
    return next(new Error('log must be set'));
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
