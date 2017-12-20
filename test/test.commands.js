const tap = require('tap');
const Rapptor = require('rapptor');

let server;

tap.afterEach(async() => {
  server.methods.methodScheduler.stopSchedule('http1');
  await server.stop();
});

tap.test('/health (without any text) returns list of options', { timeout: 6000 }, async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  wait(5000);
  const response = await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: ''
    }
  });
  t.equal(response.result, `Options:
        status: list last known status for each url
        check: re-runs health check for all urls
        [name]: re-runs health check for the specified the url entry
        certs: re-runs certification check for all urls`);
  t.end();
});

tap.test('accepts health command "status"', { timeout: 6000 }, async(t) => {
  // must update all and wait for results before checking with slack:
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
  const response = await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'status'
    }
  });
  t.equal(response.result.response_type, 'in_channel', 'inserts in_channel response type');
  t.equal(response.result.attachments[0].title, 'http1', 'prints the correct text');
  t.end();
});

tap.test('accepts health command "check"', async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
  const response = await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'check'
    }
  });
  t.equal(response.result, 'Proceeding to update status for all urls....');
  t.end();
});

tap.test('accepts individual urls', async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
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
  await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'http1'
    }
  });
});

tap.test('returns Not Found if no url by that name', { timeout: 6000 }, async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
  const response = await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'name'
    }
  });
  t.equal(response.statusCode, 404);
  t.end();
});

tap.test('accepts health command "certs"', { timeout: 6000 }, async(t) => {
  const rapptor = new Rapptor({ env: 'test' });
  await rapptor.start();
  server = rapptor.server;
  server.methods.runall();
  server.settings.app.urls = {};
  server.settings.app.urls = [{
    name: 'HTTPS Test',
    url: process.env.HEALTHCHECK_TEST_URL,
    interval: 'every 2 seconds',
    expireLimit: 1000 * 60 * 60 * 24 * 1000
  }];
  const response = await server.inject({
    method: 'POST',
    url: '/api/command',
    payload: {
      token: process.env.SLACK_TOKEN,
      command: '/health',
      text: 'certs'
    }
  });
  t.equal(response.result.text, 'Certification Statuses');
  t.equal(Array.isArray(response.result.attachments), true);
  t.end();
});
