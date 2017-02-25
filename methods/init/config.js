const yaml = require('js-yaml');
const fs = require('fs');

module.exports = {
  method(configfile, done) {
    try {
      const config = yaml.safeLoad(fs.readFileSync(configfile, 'utf8'));
      done(null, config);
    } catch (e) {
      done(e);
    }
  }
};
