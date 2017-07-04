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
      return done(null, rapptor[0]);
    },
  }, allDone);
});

lab.afterEach((done) => {
  // stop the method shceudler
  server.stop(() => {
    done();
  });
});

lab.test('url ping', { timeout: 6000 }, (done) => {
  let called = false;
  server.route({
    method: 'get',
    path: '/test/ping',
    handler(request, reply) {
      reply({ statusCode: 200, headers: request.headers }).code(200);
    }
  });
  server.methods.report = (data, result) => {
    if (data.name === 'http' && !called) {
      called = true;
      code.expect(result.up).to.equal(true);
      return done();
    }
  };
});
