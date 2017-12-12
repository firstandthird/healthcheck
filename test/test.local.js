const tap = require('tap');
const Rapptor = require('rapptor');

tap.test('schedules network http', async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  const server = rapptor.server;
  let called = false;
  server.route({
    method: 'get',
    path: '/test/http',
    handler(request, h) {
      return 'hello';
    }
  });
  let results;
  server.methods.report = async(data, result) => {
    if (data.name === 'http1' && !called) {
      results = result;
    }
  };
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await wait(2000);
  server.methods.methodScheduler.stopSchedule('http1');
  await server.stop();
  t.equal(results.up, true);
  t.end();
});
