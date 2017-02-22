const sumBy = require('lodash.sumby');
const minBy = require('lodash.minby');
const maxBy = require('lodash.maxby');

exports.all = {
  method: 'GET',
  path: '/api/all',
  handler(request, reply) {
    const server = request.server;
    const db = server.plugins.healthcheck.db;
    const results = db.get('results') || {};
    const output = {};

    Object.keys(results).forEach(result => {
      const averageResponse = sumBy(results[result], 'responseTime') / results[result].length;
      const minResponse = minBy(results[result], 'responseTime');
      const maxResponse = maxBy(results[result], 'responseTime');

      output[result] = {
        averageResponse,
        minResponse,
        maxResponse,
        results: results[result]
      }
    });

    reply(output);
  }
}
