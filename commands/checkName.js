// note: since this expression matches everything, this file's name must be
// the last one in alphabetical order in the /commands folder
const boom = require('boom');

// triggers a check of [name]
module.exports = {
  expression: 'check (.*)',
  priority: 0,
  handler (slackPayload, match) {
    const server = this.server;
    const name = match[1];
    let url;
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
};
