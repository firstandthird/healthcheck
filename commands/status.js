const boom = require('boom');

module.exports = {
  expression: 'status',
  async handler(slackPayload, match) {
    const response = await this.server.inject({
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
  },
  description: 'list last known status for each url'
};
