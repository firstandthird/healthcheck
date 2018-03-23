// triggers certs check
module.exports = {
  expression: 'certs',
  async handler(slackPayload, match) {
    const response = await this.server.inject({
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
  },
  description: 'certs: re-runs certification check for all urls'
};
