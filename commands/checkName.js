const boom = require('boom');

function handler (slackPayload, match) {
  const server = this.server;
  const name = slackPayload.text;
  let url;
  if (name === '') {
    return `Options:
      status: list last known status for each url
      check: re-runs health check for all urls
      [name]: re-runs health check for the specified the url entry
      certs: re-runs certification check for all urls`;
  }
  server.settings.app.urls.forEach((data) => {
    if (data.name === name || data.url === name) {
      url = data;
    }
  });
  if (!url) {
    return boom.notFound(`no url match found for ${slackPayload.text}`);
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
  return `checking url ${slackPayload.text}...`;
}

// triggers a check of [name]
module.exports = {
  expression: '(.*)',
  handler
};
