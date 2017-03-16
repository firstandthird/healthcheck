module.exports = {
  method(slackConfig, done) {
    if (slackConfig) {
      this.settings.app.plugins['hapi-logr'].reporters.slack.options = Object.assign(this.settings.app.plugins['hapi-logr'].reporters.slack.options, slackConfig);
    } else {
      this.settings.app.plugins['hapi-logr'].reporters.slack.options.enabled = false;
    }

    done();
  }
};
