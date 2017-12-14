const flatfile = require('flat-file-db');

const register = (server, options) => {
  const args = require('yargs').argv;
  const logPath = options.logPath || args.log;
  if (!logPath) {
    return Promise.reject(new Error('log path must be specified either as env variable $LOG_PATH or with --log option'));
  }
  const db = flatfile.sync(logPath);
  server.expose('db', db);
  db.on('error', (e) => {
    server.log(['error'], e);
  });
};

exports.plugin = {
  name: 'db',
  register,
  once: true,
  pkg: require('../package.json')
};
