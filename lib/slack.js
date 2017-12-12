const boom = require('boom');

const register = async (server) => {
  const getStatuses = async() => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/all',
    });
    if (response.statusCode !== 200) {
      throw boom.badImplementation(response.statusMessage);
    }
    let returnString = '';
    Object.keys(response.result).forEach((name) => {
      const service = response.result[name];
      const lastResult = service.results[service.results.length - 1];
      returnString += `${name}: ${lastResult.up ? 'UP' : 'DOWN'} ${lastResult.slow ? '(SLOW)' : ''} \n`;
    });
    return returnString;
  };
  server.registerSlackCommand('status', (slackPayload, match) => {
    return getStatuses();
  }, 'list last known status for each url');
  // // triggers a check of all urls
  server.registerSlackCommand('check', async (slackPayload, match) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/runall',
    });
    return 'Proceeding to update status for all urls....';
  }, 're-runs health check for all urls');
  // // triggers certs check
  server.registerSlackCommand('certs', async (slackPayload, match) => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/cert',
    });
    return response.result;
  }, 'certs: re-runs certification check for all urls');
  // triggers a check of [name]
  server.registerSlackCommand('(.*)', async (slackPayload, match) => {
    const name = slackPayload.text;
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
  });
};

exports.plugin = {
  name: 'slack',
  register,
  once: true,
  pkg: require('../package.json')
};
