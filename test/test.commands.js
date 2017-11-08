const tap = require('tap');
const async = require('async');
const Rapptor = require('rapptor');

let server;
tap.beforeEach((allDone) => {
  async.autoInject({
    rapptor(done) {
      const rapptor = new Rapptor({ env: 'test' });
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

tap.test('accepts health command "status"', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'status'
    }
  }, (response) => {
    const obj = JSON.parse(response.payload);
    t.equal(typeof obj.http1, 'object');
    t.equal(typeof obj.http2, 'object');
    t.equal(typeof obj['HTTPS Test'], 'object');
    t.end();
  });
});

tap.test('accepts health command "check"', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'check'
    }
  }, (response) => {
    console.log(response.statusCode)
    t.end();
  });
});
/*
tap.test('accepts health command "certs"', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'certs'
    }
  }, (response) => {
    console.log(response.statusCode)
    t.end();
  });
});

tap.test('accepts health command "name"', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'name'
    }
  }, (response) => {
    console.log(response.statusCode)
    t.end();
  });
});
*/
