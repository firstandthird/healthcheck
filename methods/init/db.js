const flatfile = require('flat-file-db');
module.exports = {
  method(dbfile, done) {
    const db = flatfile(dbfile);
    
    db.on('open', () => {
      done(null, db);
    });
  }
};