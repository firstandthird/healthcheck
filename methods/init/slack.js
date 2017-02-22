module.exports = {
  method(done) {
    const server = this;
    let plugin = this.settings.app.plugins['hapi-slack'];
    const config = server.plugins.healthcheck.config;

    if (config.slack) {
      plugin = Object.assign(plugin, { _enabled: true }, config.slack);
    }

    done();
  }
};
