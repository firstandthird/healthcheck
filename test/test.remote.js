const tap = require('tap');
const async = require('async');
const Hapi = require('hapi');
const Rapptor = require('rapptor');

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
          reply(null, {
            urls: [{
              name: 'http2',
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
    rapptor(done) {
      process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
      const rapptor = new Rapptor();
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.route({
        method: 'get',
        path: '/test/http',
        handler(request, reply) {
          reply({ headers: request.headers }).code(200);
        }
      });
      return done(null, rapptor[0]);
    },
    // wait for it to make calls and log things:
    wait(setup, done) {
      setTimeout(done, 4000);
    },
    verify(wait, done) {
      // should have made a log entry for the results:
      const output = server.plugins.db.db.get('results');
      t.notEqual(output, undefined);
      t.notEqual(output.http2, undefined);
      done();
    },
    cleanConfig(configServer, verify, done) {
      configServer.stop(done);
    },
    cleanup(verify, done) {
      server.methods.methodScheduler.stopSchedule('http2');
      server.stop(done);
    }
  }, (err, result) => {
    t.equal(err, null);
    t.end();
  });
});

tap.test('can match a specific status code', (t) => {
  let called = false;
  async.autoInject({
    // set up a remote route that healthcheck can get its config from:
    configServer(done) {
      const configServer = new Hapi.Server();
      configServer.connection({ port: 3000 });
      configServer.route({
        method: 'get',
        path: '/confi',
        handler(request, reply) {
          reply(null, {
            urls: [{
              name: 'http2',
              url: 'http://localhost:8080/test/http',
              type: 'http',
              statusCode: '301',
              interval: 'every 2 seconds'
            }]
          });
        }
      });
      configServer.start(() => {
        done(null, configServer);
      });
    },
    rapptor(done) {
      process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
      const rapptor = new Rapptor();
      rapptor.start(done);
    },
    setup(rapptor, done) {
      server = rapptor[0];
      server.route({
        method: 'get',
        path: '/test/http',
        handler(request, reply) {
          reply({ headers: request.headers }).code(301);
        }
      });
      server.methods.report = (data, result) => {
        if (!called) {
          t.equal(result.up, true);
          called = true;
        }
      };
      return done(null, rapptor[0]);
    },
    // wait for it to make calls and log things:
    wait(setup, done) {
      setTimeout(done, 4000);
    },
    cleanConfig(configServer, wait, done) {
      configServer.stop(done);
    },
    cleanup(wait, done) {
      server.methods.methodScheduler.stopSchedule('http2');
      server.stop(done);
    }
  }, (err, result) => {
    t.equal(err, null);
    called = true;
    t.end();
  });
});
