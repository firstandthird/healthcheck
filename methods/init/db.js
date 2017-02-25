const flatfile = require('flat-file-db');
module.exports = {
  method(dbfile, done) {
    const server = this;
    const db = flatfile(dbfile);

    db.on('open', () => {
      done(null, db);
    });
    db.on('error', (e) => {
      server.log(['error'], e);
    });
  }
};
