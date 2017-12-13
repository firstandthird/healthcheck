const sumBy = require('lodash.sumby');
const minBy = require('lodash.minby');
const maxBy = require('lodash.maxby');

module.exports = {
  method() {
    const server = this;
    const db = server.plugins.db.db;
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
      };
    });
    return output;
  }
};
