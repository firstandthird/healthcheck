module.exports = {
  expression: '^check$',
  priority: 1,
  async handler(slackPayload, match) {
    await this.server.inject({
      method: 'GET',
      url: '/api/runall',
    });
    return 'Proceeding to update status for all urls....';
  },
  description: 're-runs health check for all urls'
};
