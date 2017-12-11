const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');

tap.test('schedules network http', { timeout: 6000 }, async(t) => {
  let called = false;
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
    console.log('+++++++++++++++++++++++++++++=')
    console.log('+++++++++++++++++++++++++++++=')
    console.log('+++++++++++++++++++++++++++++=')
    console.log(data)
    console.log(result)
    if (data.name === 'http1' && !called) {
      called = true;
      server.methods.methodScheduler.stopSchedule('http1');
      t.equal(result.up, true);
      await server.stop();
      t.end();
    }
  };
});
