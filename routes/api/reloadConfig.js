exports.reloadConfig = {
  method: 'GET',
  path: '/api/reloadconfig',
  handler(request, reply) {
    const server = request.server;
    const plugin = server.plugins.healthcheck;
    const scheduler = server.settings.app.plugins['hapi-method-scheduler'];

    server.methods.init.config(plugin.configPath, plugin.isRemoteConfig, (err, data) => {
      if (err) {
        return reply(err);
      }
      scheduler.schedule.forEach(item => {
        server.methods.methodScheduler.stopSchedule(item.method);
      });

      scheduler.schedule = [];

      server.methods.init.schedule(data, () => {
        scheduler.schedule.forEach(item => {
          server.methods.methodScheduler.stopSchedule(item.method);
        });

        reply({ success: true });
      });
    });
  }
};
