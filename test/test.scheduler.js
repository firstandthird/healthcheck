const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');

let server;
tap.beforeEach((allDone) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor();
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.route({
        method: 'get',
        path: '/test/http',
        handler(request, reply) {
          reply({ statusCode: 200, headers: request.headers }).code(200);
        }
      });
      return done(null, rapptor[0]);
    },
  }, allDone);
});

tap.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

tap.test('schedules network http', { timeout: 6000 }, (t) => {
  let called = false;
  server.methods.report = (data, result) => {
    if (data.name === 'http1' && !called) {
      called = true;
      server.methods.methodScheduler.stopSchedule('http1');
      server.methods.methodScheduler.stopSchedule('ping1');
      t.equal(result.up, true);
      t.end();
    }
  };
});

tap.test('schedules network ping', { timeout: 6000 }, (t) => {
  let called = false;
  server.methods.report = (data, result) => {
    if (data.name === 'ping1' && !called) {
      called = true;
      t.equal(result.up, true);
      server.methods.methodScheduler.stopSchedule('http1');
      server.methods.methodScheduler.stopSchedule('ping1');
      t.end();
    }
  };
});
