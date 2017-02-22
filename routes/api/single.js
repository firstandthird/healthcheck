const sumBy = require('lodash.sumby');
const minBy = require('lodash.minby');
const maxBy = require('lodash.maxby');

exports.single = {
  method: 'GET',
  path: '/api/single',
  handler(request, reply) {
    const server = request.server;
    const db = server.plugins.healthcheck.db;
    const results = db.get('results') || {};
    const result = results[request.query.name] || [];

    const averageResponse = sumBy(result, 'responseTime') / result.length;
    const minResponse = minBy(result, 'responseTime');
    const maxResponse = maxBy(result, 'responseTime');

    const output = {
      averageResponse,
      minResponse,
      maxResponse,
      results: result
    };

    reply(output);
  }
}
