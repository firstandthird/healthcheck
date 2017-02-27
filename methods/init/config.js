const yaml = require('js-yaml');
const fs = require('fs');
const Wreck = require('wreck');

module.exports = {
  method(configfile, isRemote, done) {
    if (isRemote) {
      return Wreck.get(configfile, { json: true }, (err, res, data) => {
        if (err) {
          return done(err);
        }

        if (data instanceof Buffer) {
          try {
            const config = yaml.safeLoad(data.toString());
            return done(null, config);
          } catch (e) {
            return done(e);
          }
        } else {
          return done(null, data);
        }
      });
    }

    try {
      const config = yaml.safeLoad(fs.readFileSync(configfile, 'utf8'));
      return done(null, config);
    } catch (e) {
      return done(e);
    }
  }
};
