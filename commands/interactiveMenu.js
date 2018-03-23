module.exports = {
  expression: '*',
  priority: 5,
  handler: (slackPayload, match) => ({
    response_type: 'in_channel',
    attachments: [
      {
        text: 'Choose a command',
        attachment_type: 'default',
        callback_id: 'command',
        actions: [
          {
            name: 'command_list',
            text: 'pick a command...',
            type: 'select',
            options: [
              {
                text: 'list status for each url',
                value: 'status'
              },
              {
                text: 're-run all certification checks',
                value: 'cert'
              },
              {
                text: 're-runs health check for all urls',
                value: 'check'
              },
              {
                text: 're-runs health check for all urls',
                value: 'check'
              },
            ]
          }
        ]
      }
    ]
  })
};
