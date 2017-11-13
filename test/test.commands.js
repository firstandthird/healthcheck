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

tap.test('/health (without any text) returns list of options', { timeout: 6000 }, (t) => {
  server.methods.runall();
  setTimeout(() => {
    server.inject({
      method: 'POST',
      url: '/api/command',
      payload: {
        token: process.env.SLACK_TOKEN,
        command: '/health',
        text: ''
      }
    }, (response) => {
      t.equal(response.result, `Options:
        status: list last known status for each url
        check: re-runs health check for all urls
        [name]: re-runs health check for the specified the url entry
        certs: re-runs certification check for all urls`);
      t.end();
    });
  }, 5000);
});

tap.test('accepts health command "status"', { timeout: 6000 }, (t) => {
  // must update all and wait for results before checking with slack:
  server.methods.runall();
  setTimeout(() => {
    server.inject({
      method: 'POST',
      url: '/api/command',
      payload: {
        token: process.env.SLACK_TOKEN,
        command: '/health',
        text: 'status'
      }
    }, (response) => {
      t.notEqual(response.result.indexOf('http1: DOWN'), -1);
      t.end();
    });
  }, 5000);
});

tap.test('accepts health command "check"', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'check'
    }
  }, (response) => {
    t.equal(response.result.success, true);
    t.end();
  });
});

tap.test('accepts individual urls', { timeout: 6000 }, (t) => {
  server.methods.checkurl = (data) => {
    t.deepEqual(data, { name: 'http1',
      url: 'http://localhost:8080/test/http',
      type: 'http',
      statusCode: 200,
      responseThreshold: 1000,
      timeout: 10000,
      retryDelay: 1000,
      retryCount: 1,
      checkCount: 0
    });
    t.end();
  };
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'http1'
    }
  }, (response) => {
  });
});

tap.test('returns Not Found if no url by that name', { timeout: 6000 }, (t) => {
  server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
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
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'certs'
    }
  }, (response) => {
    t.equal(typeof response.result[process.env.HEALTHCHECK_TEST_URL], 'string');
    t.end();
  });
});
