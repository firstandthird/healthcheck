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
  server.stop(() => {
    done();
  });
});

tap.test('starts up', (t) => {
  console.log(server)
  t.end();
});
