module.exports = {
  method(slackConfig, done) {
    if (slackConfig) {
      this.settings.app.plugins['hapi-slack'] = Object.assign(this.settings.app.plugins['hapi-slack'], slackConfig);
    } else {
      this.settings.app.plugins['hapi-slack'].tags = [];
    }

    done();
  }
};
