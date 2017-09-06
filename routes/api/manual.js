const https = require('https');
const async = require('async');
exports.manual = {
  method: 'GET',
  path: '/api/cert',
  handler(request, reply) {
    const server = request.server;
    const config = server.settings.app;
    const expirations = {};
    async.each(config.urls, (obj, eachDone) => {
      const url = obj.url;
      if (!url.startsWith('https:')) {
        return eachDone();
      }
      server.methods.getFreshCertificate(url.replace('https://', ''), (err, res) => {
        if (err) {
          expirations[url] = err;
          return eachDone();
        }
        const day = 24 * 60 * 60 * 1000;
        expirations[url] = `Expires in ${(res.expiresIn / day).toFixed(1)} days on ${res.expiresOn}`;
        eachDone();
      });
    }, (err) => {
      if (err) {
        return reply().code(500);
      }
      reply(null, expirations);
    });
  }
};
