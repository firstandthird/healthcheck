const boom = require('boom');

exports.register = (server, options, next) => {
  server.registerSlackCommand('/health', {
    // returns the status of all the urls
    status(slackPayload, match, statusDone) {
      server.inject({
        method: 'GET',
        url: '/api/all',
      }, (response) => statusDone(null, response.payload));
    },
    // triggers a check of all urls
    check(slackPayload, match, checkDone) {
      server.methods.runall();
      checkDone(null, 'checking all urls');
    },
    // triggers certs check
    certs(slackPayload, match, certsDone) {
      console.log('certs')
      console.log('certs')
      certsDone(null, 'hello');
    },
    // triggers a check of [name]
    '(.*)'(slackPayload, match, done) {
      server.methods.checkurl({ type: 'http' })
      console.log('*')
      console.log('*')
      console.log(slackPayload);
      console.log(match);
      done(null, 'goodbye');
    }
  });
  next();
};

exports.register.attributes = {
  name: 'slack'
};
