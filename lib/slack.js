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
    const send = {
      response_type: 'in_channel',
      text: 'Server Statuses',
      attachments: []
    };
    const res = response.result;
    Object.keys(res).forEach((key) => {
      const item = res[key];
      const mostRecent = item.results[item.results.length - 1];
      const status = mostRecent.up ? 'UP' : 'DOWN';
      const attachment = {
        title: key,
        fields: [
          { title: 'Status', value: status },
          { title: 'Last Checked', value: new Date(mostRecent.timestamp) },
        ]
      };
      if (status === 'UP') {
        if (mostRecent.slow) {
          attachment.color = 'warning';
          attachment.fields.push({ title: 'Slow Response' });
        } else {
          attachment.color = 'good';
        }
      } else {
        attachment.color = 'danger';
      }
      send.attachments.push(attachment);
    });
    return send;
  };
  server.registerSlackCommand('status', (slackPayload, match) => {
    return getStatuses();
  }, 'list last known status for each url');
  // // triggers a check of all urls
  server.registerSlackCommand('check', async (slackPayload, match) => {
    await server.inject({
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
    const send = {
      response_type: 'in_channel',
      text: 'Certification Statuses',
      attachments: []
    };
    const res = response.result;
    const day = 24 * 60 * 60 * 1000;
    Object.keys(res).forEach((key) => {
      const item = res[key];
      const expiresIn = (item.expiresIn / day).toFixed(1);
      const attachment = {
        title: key,
        fields: [
          { title: 'Expires In', value: expiresIn },
          { title: 'Expiration Date', value: item.expiresOn }
        ]
      };
      if (expiresIn < 7) {
        attachment.color = 'warning';
      }
      if (expiresIn < 2) {
        attachment.color = 'danger';
      }
      send.attachments.push(attachment);
    });
    return send;
  }, 'certs: re-runs certification check for all urls');
  // triggers a check of [name]
  server.registerSlackCommand('(.*)', async (slackPayload, match) => {
    const name = slackPayload.text;
    let url;
    if (name === '') {


      return {
        text: 'test',
        response_type: 'in_channel',
        attachments: [
          {
            text: 'Pick a command',
            callback_id: 'command',
            actions: [
              {
                name: 'command_list',
                text: 'Commands...',
                type: 'select',
                options: [
                  {
                    text: 'All Statuses',
                    value: 'status'
                  },
                  {
                    text: 'Run Checks',
                    value: 'check'
                  }
                ]
              }
            ]
          }
        ]
      };


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
  });

  server.registerSlackCallback('command', (payload) => {
    console.log(payload);
    return 'ok';
  });
};

exports.plugin = {
  name: 'slack',
  register,
  once: true,
  pkg: require('../package.json')
};
