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
      return done(null, rapptor[0]);
    },
  }, allDone);
});

tap.afterEach((done) => {
  // stop the method shceudler
  server.stop(() => {
    done();
  });
});

tap.test('url ping', (t) => {
  let called = false;
  server.route({
    method: 'get',
    path: '/test/ping',
    handler(request, reply) {
      console.log('??????')
      console.log('??????')
      console.log('??????')
      console.log('??????')
      reply({ statusCode: 200, headers: request.headers }).code(200);
    }
  })
  server.methods.report = (data, result) => {
    if (data.name === 'ping' && !called) {
      called = true;
      console.log(data)
      console.log(result)
      console.log(server.methods.methodScheduler)
      // t.equal(result.up, true, 'pings the destination address');
      t.end();
    }
  };
});
