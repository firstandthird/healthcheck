const boom = require('boom');

exports.register = (server, options, next) => {
  server.registerSlackCommand('/health', {
    // returns the status of all the urls
    '': (slackPayload, match, statusDone) => {
      server.inject({
        method: 'GET',
        url: '/api/all',
      }, (response) => statusDone(null, response.payload));
    },
    status(slackPayload, match, statusDone) {
      server.inject({
        method: 'GET',
        url: '/api/all',
      }, (response) => statusDone(null, response.payload));
    },
    // triggers a check of all urls
    check(slackPayload, match, checkDone) {
      server.inject({
        method: 'GET',
        url: '/api/runall',
      }, (response) => checkDone(null, response.result));
    },
    // triggers certs check
    certs(slackPayload, match, certsDone) {
      server.inject({
        method: 'GET',
        url: '/api/cert',
      }, (response) => certsDone(null, response.result));
    },
    // triggers a check of [name]
    '(.*)'(slackPayload, match, done) {
      const name = slackPayload.text;
      let url;
      server.settings.app.urls.forEach((data) => {
        if (data.name === name || data.url === name) {
          url = data;
        }
      });
      if (!url) {
        return done(boom.notFound(`no url match found for ${slackPayload.text}`));
      }
      const config = server.settings.app;
      server.methods.checkurl({
        name: url.name || url.url,
        url: url.url,
        type: 'http',
        statusCode: url.statusCode || 200,
        responseThreshold: url.responseThreshold || config.responseThreshold || 1000,
        timeout: url.timeout || config.timeout || 10000,
        retryDelay: url.retryDelay || config.retryDelay || 1000,
        retryCount: url.retryCount || config.retryCount || 1,
        checkCount: 0
      });
      done(null, `checking url ${slackPayload.text}...`);
    }
  });
  next();
};

exports.register.attributes = {
  name: 'slack'
};
