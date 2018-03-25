module.exports = {
  name: 'command',
  handler(slackPayload, actionName, actionValue) {
    return this.runCommand(actionValue, slackPayload);
  }
};
