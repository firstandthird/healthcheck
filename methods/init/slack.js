module.exports = {
  method(done) {
    const server = this;
    const config = server.plugins.healthcheck.config;

    if (config.slack) {
      this.settings.app.plugins['hapi-slack'] = Object.assign(this.settings.app.plugins['hapi-slack'], config.slack);
    }

    done();
  }
};
