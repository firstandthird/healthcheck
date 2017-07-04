const code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const async = require('async');
const Rapptor = require('rapptor');

let server;
lab.beforeEach((allDone) => {
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

lab.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

lab.test('schedules network http', { timeout: 6000 }, (done) => {
  let called = false;
  server.methods.report = (data, result) => {
    if (data.name === 'http1' && !called) {
      called = true;
      code.expect(result.up).to.equal(true);
      return done();
    }
  };
});

lab.test('schedules network ping', { timeout: 6000 }, (done) => {
  let called = false;
  server.methods.report = (data, result) => {
    if (data.name === 'ping1' && !called) {
      called = true;
      code.expect(result.up).to.equal(true);
      return done();
    }
  };
});
