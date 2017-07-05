const tap = require('tap');
const async = require('async');
const Hapi = require('hapi');
let server;
tap.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

tap.test('can load a schedule from remote', (t) => {
  async.autoInject({
    // set up a remote route that healthcheck can get its config from:
    configServer(done) {
      const configServer = new Hapi.Server();
      configServer.connection({ port: 3000 });
      configServer.route({
        method: 'get',
        path: '/confi',
        handler(request, reply) {
          console.log('fetching')
          console.log('fetching')
          console.log('fetching')
          console.log('fetching')
          reply(null, {
            urls: [{
              name: 'http1',
              url: 'http://localhost:8080/test/http',
              type: 'http',
              interval: 'every 2 seconds'
            }]
          });
        }
      });
      configServer.start(() => {
        done(null, configServer);
      });
    },
    setup(configServer, done) {
      // a config that does not specify any schedules:
      process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
      server = new Hapi.Server();
      server.connection({ port: 8080 });
      server.register({
        register: require('../lib/healthcheck.js'),
        options: {}
      }, (err) => {
        server.start(() => done(null, server));
      });
    },
    wait(setup, done) {
      setTimeout(done, 2000);
    },
    verify(wait, done) {
      done();
    },
    cleanup(configServer, verify, done) {
      configServer.stop(() => done());
    }
  }, (err, result) => {
    t.equal(err, null);
    t.end();
  });
});

// tap.test('can use db plugin', { timeout: 6000 }, (t) => {
//   async.autoInject({
//     setup(done) {
//       process.env.LOG_PATH = `${__dirname}/config/db.log`;
//       server = new Hapi.Server();
//       server.connection({ port: 3000 });
//       server.register({
//         register: require('../lib/db.js'),
//         options: {}
//       }, (err) => {
//         server.start(() => {
//           return done(null, server);
//         });
//       });
//     },
//     put(setup, done) {
//       server.plugins.db.db.put('results', { some: 'stuff' });
//       done();
//     },
//     get(put, done) {
//       return done(null, server.plugins.db.db.get('results'));
//     },
//     verify(get, done) {
//       t.equal(typeof get, 'object', 'returns an object from the db');
//       t.equal(get.some, 'stuff', 'returns the stored data');
//       done();
//     }
//   }, (err, result) => {
//     t.equal(err, null, 'does not error');
//     t.end();
//   });
// });
