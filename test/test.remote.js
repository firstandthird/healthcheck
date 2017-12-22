const tap = require('tap');
const Hapi = require('hapi');
const Rapptor = require('rapptor');
const boom = require('boom');

tap.test('can load a schedule from remote', async(t) => {
  // set up a remote route that healthcheck can get its config from:
  const configServer = new Hapi.Server({ port: 3000 });
  configServer.route({
    method: 'get',
    path: '/confi',
    handler(request, h) {
      return {
        urls: [{
          name: 'http2',
          url: 'http://localhost:8080/test/http',
          type: 'http',
          interval: 'every 2 seconds'
        }]
      };
    }
  });
  await configServer.start();
  process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
  const rapptor = new Rapptor();
  await rapptor.start();
  const server = rapptor.server;
  server.route({
    method: 'get',
    path: '/test/http',
    handler(request, h) {
      return { headers: request.headers };
    }
  });
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await wait(4000);
  // should have made a log entry for the results:
  const output = server.plugins.db.db.get('results');
  t.notEqual(output, undefined);
  t.notEqual(output.http2, undefined);
  await configServer.stop();
  server.methods.methodScheduler.stopSchedule('http2');
  await server.stop();
  t.end();
});

tap.test('can match a specific status code', async (t) => {
  let called = false;
  // set up a remote route that healthcheck can get its config from:
  const configServer = new Hapi.Server({ port: 3000 });
  configServer.route({
    method: 'get',
    path: '/confi',
    handler(request, h) {
      return {
        urls: [{
          name: 'http2',
          url: 'http://localhost:8080/test/http',
          type: 'http',
          statusCode: '301',
          interval: 'every 2 seconds'
        }]
      };
    }
  });
  await configServer.start();
  process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
  const rapptor = new Rapptor();
  await rapptor.start();
  const server = rapptor.server;
  server.route({
    method: 'get',
    path: '/test/http',
    handler(request, h) {
      return h.redirect('http://somewhere.com').permanent();
    }
  });
  server.methods.report = (data, result) => {
    if (!called) {
      t.equal(result.up, true);
      called = true;
    }
  };
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await wait(4000);
  server.methods.methodScheduler.stopSchedule('http2');
  await server.stop();
  await configServer.stop();
  t.end();
});

tap.test('can match an error status code', async(t) => {
  let called = false;
  // set up a remote route that healthcheck can get its config from:
  const configServer = new Hapi.Server({ port: 3000 });
  configServer.route({
    method: 'get',
    path: '/confi',
    handler(request, h) {
      return {
        urls: [{
          name: 'http2',
          url: 'http://localhost:8080/test/http',
          type: 'http',
          statusCode: '404',
          interval: 'every 2 seconds'
        }]
      };
    }
  });
  await configServer.start();
  process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
  const rapptor = new Rapptor();
  await rapptor.start();
  const server = rapptor.server;
  server.route({
    method: 'get',
    path: '/test/http',
    handler(request, h) {
      throw boom.notFound('route not found');
    }
  });
  server.methods.report = (data, result) => {
    if (!called) {
      t.equal(result.up, true);
      called = true;
    }
  };
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await wait(4000);
  await configServer.stop();
  server.methods.methodScheduler.stopSchedule('http2');
  await server.stop();
  called = true;
  t.end();
});

tap.test('server.methods.report reports info on certification failure', async(t) => {
  // set up a remote route that healthcheck can get its config from:
  const configServer = new Hapi.Server({ port: 3000 });
  configServer.route({
    method: 'get',
    path: '/confi',
    handler(request, h) {
      return {
        urls: []
      };
    }
  });
  await configServer.start();
  process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
  const rapptor = new Rapptor();
  await rapptor.start();
  const server = rapptor.server;
  server.log = (tags, input) => {
    t.notEqual(tags.indexOf('HTTPS Test'), -1, 'contains tag with name of task');
    t.notEqual(tags.indexOf('certificate-expiration'), -1, 'contains "certificate-expiration" tag');
    t.notEqual(input.message.startsWith('The SSL certificate for HTTPS Test expires in '), 'certificate expiration explains what it is warning about');
  };
  const data = {
    name: 'HTTPS Test',
    type: 'certification',
    url: process.env.HEALTHCHECK_TEST_URL
  };
  const result = {
    url: process.env.HEALTHCHECK_TEST_URL,
    expireMin: 86400000000,
    expiresIn: 4199784696
  };
  server.methods.report(data, result);
  await configServer.stop();
  await server.stop();
  t.end();
});

tap.test('can handle cert warnings', async(t) => {
  t.plan(2);
  const testResults = {};
  // set up a remote route that healthcheck can get its config from:
  const configServer = new Hapi.Server({ port: 3000 });
  configServer.route({
    method: 'get',
    path: '/confi',
    handler(request, h) {
      return {
        urls: [{
          name: 'HTTPS Test',
          url: process.env.HEALTHCHECK_TEST_URL,
          interval: 'every 2 seconds',
          expireMin: 86400000000,
        }]
      };
    }
  });
  await configServer.start();
  process.env.RAPPTOR_CONFIG_URL = 'http://localhost:3000/confi';
  const rapptor = new Rapptor();
  await rapptor.start();
  const server = rapptor.server;
  server.methods.report = async(data, results) => {
    t.equal(typeof results.timestamp, 'number', 'reports the timestamp');
    t.equal(typeof results.expiresIn, 'number', 'reports the certificate expiration time');
    server.methods.methodScheduler.stopSchedule('HTTPS Test.network.cert');
    server.methods.methodScheduler.stopSchedule('HTTPS Test');
    await server.stop();
    await configServer.stop();
    t.end();
  };
  // wait for it to make calls and log things:
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await wait(5000);
});
