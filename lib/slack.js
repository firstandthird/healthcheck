const boom = require('boom');

const register = (server, options) => {
  // const getStatuses = (done) => {
  //   server.inject({
  //     method: 'GET',
  //     url: '/api/all',
  //   }, (response) => {
  //     if (response.statusCode !== 200) {
  //       return done(boom.badImplementation(response.statusMessage));
  //     }
  //     let returnString = '';
  //     Object.keys(response.result).forEach((name) => {
  //       const service = response.result[name];
  //       const lastResult = service.results[service.results.length - 1];
  //       returnString += `${name}: ${lastResult.up ? 'UP' : 'DOWN'} ${lastResult.slow ? '(SLOW)' : ''} \n`;
  //     });
  //     done(null, returnString);
  //   });
  // };
  // server.registerSlackCommand('/health', {
  //   status(slackPayload, match, statusDone) {
  //     return getStatuses(statusDone);
  //   },
  //   // triggers a check of all urls
  //   check(slackPayload, match, checkDone) {
  //     server.inject({
  //       method: 'GET',
  //       url: '/api/runall',
  //     }, (response) => checkDone(null, 'Proceeding to update status for all urls....'));
  //   },
  //   // triggers certs check
  //   certs(slackPayload, match, certsDone) {
  //     server.inject({
  //       method: 'GET',
  //       url: '/api/cert',
  //     }, (response) => certsDone(null, response.result));
  //   },
  //   // triggers a check of [name]
  //   '(.*)'(slackPayload, match, done) {
  //     const name = slackPayload.text;
  //     // blank returns the status of all the urls
  //     if (name === '') {
  //       return done(null, `Options:
  //         status: list last known status for each url
  //         check: re-runs health check for all urls
  //         [name]: re-runs health check for the specified the url entry
  //         certs: re-runs certification check for all urls`);
  //     }
  //     let url;
  //     server.settings.app.urls.forEach((data) => {
  //       if (data.name === name || data.url === name) {
  //         url = data;
  //       }
  //     });
  //     if (!url) {
  //       return done(boom.notFound(`no url match found for ${slackPayload.text}`));
  //     }
  //     const config = server.settings.app;
  //     server.methods.checkurl({
  //       name: url.name || url.url,
  //       url: url.url,
  //       type: 'http',
  //       statusCode: url.statusCode || 200,
  //       responseThreshold: url.responseThreshold || config.responseThreshold || 1000,
  //       timeout: url.timeout || config.timeout || 10000,
  //       retryDelay: url.retryDelay || config.retryDelay || 1000,
  //       retryCount: url.retryCount || config.retryCount || 1,
  //       checkCount: 0
  //     });
  //     done(null, `checking url ${slackPayload.text}...`);
  //   },
  // });
};

exports.plugin = {
  register,
  once: true,
  pkg: require('../package.json')
};
