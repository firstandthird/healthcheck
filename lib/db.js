const flatfile = require('flat-file-db');

const register = (server, options) => {
  const args = require('yargs').argv;
  const logPath = options.logPath || args.log;
  if (!logPath) {
    throw new Error('log path must be specified either as env variable $LOG_PATH or with --log option');
  }
  const db = flatfile(logPath);
  db.on('error', (e) => {
    server.log(['error'], e);
  });
  db.on('open', () => {
    server.expose('db', db);
  });
};

exports.plugin = {
  register,
  once: true,
  pkg: require('../package.json')
};
