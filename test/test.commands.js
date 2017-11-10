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
  server.methods.methodScheduler.stopSchedule('http1');
  server.stop(() => {
    done();
  });
});

tap.test('accepts health command "status"', { timeout: 6000 }, (t) => {
  server.settings.app.urls.http1 = {
    name: 'name',
    url: 'http://localhost:8080/test/http',
    type: 'http',
    interval: 'every 2 seconds',
    statusCode: 200,
    responseThreshold: 2000,
    timeout: 2000,
    retryDelay: 500,
    retryCount: 1000,
  };
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
    t.equal(response.result.success, true);
    t.end();
  });
});

tap.test('accepts individual urls', { timeout: 6000 }, (t) => {
  const url = 'https://theUrl.com';
  server.settings.app.urls[url] = {
    name: 'name',
    url: 'url',
    statusCode: 200,
    responseThreshold: 2000,
    timeout: 2000,
    retryDelay: 500,
    retryCount: 1000,
  };
  server.methods.checkurl = (data) => {
    t.deepEqual(data, {
      type: 'http',
      checkCount: 0,
      name: 'name',
      url: 'url',
      statusCode: 200,
      responseThreshold: 2000,
      timeout: 2000,
      retryDelay: 500,
      retryCount: 1000,
    });
    t.end();
  };
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: url
    }
  }, (response) => {
  });
});

tap.test('returns Not Found if no url by that name', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'name'
    }
  }, (response) => {
    t.equal(response.statusCode, 404);
    t.end();
  });
});

tap.test('accepts health command "certs"', { timeout: 6000 }, (t) => {
  server.settings.app.urls = {};
  server.settings.app.urls = [{
    name: 'HTTPS Test',
    url: process.env.HEALTHCHECK_TEST_URL,
    interval: 'every 2 seconds',
    expireLimit: 1000 * 60 * 60 * 24 * 1000
  }];
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: 'aToken',
      command: '/health',
      text: 'certs'
    }
  }, (response) => {
    t.equal(typeof response.result[process.env.HEALTHCHECK_TEST_URL], 'string');
    t.end();
  });
});
