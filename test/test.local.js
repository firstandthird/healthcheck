const tap = require('tap');
const Rapptor = require('rapptor');

tap.test('schedules network http', async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  const server = rapptor.server;
  server.route({
    method: 'get',
    path: '/test/http',
    handler(request, h) {
      return 'hello';
    }
  });
  server.methods.report = async(data, result) => {
    if (data.name === 'http1') {
      if (result.up) {
        server.methods.methodScheduler.stopSchedule('http1');
        await server.stop();
        t.end();
      }
    }
  };
});
