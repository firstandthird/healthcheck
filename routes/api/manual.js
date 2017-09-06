const https = require('https');
const async = require('async');
exports.manual = {
  method: 'GET',
  path: '/api/cert',
  handler(request, reply) {
    const config = request.server.settings.app;
    const expirations = {};
    async.each(config.urls, (obj, eachDone) => {
      const url = obj.url;
      if (!url.startsWith('https:')) {
        return eachDone();
      }
      https.get(url, (res) => {
        const certInfo = res.socket.getPeerCertificate();
        const expiresIn = new Date(certInfo.valid_to).getTime() - new Date().getTime();
        const day = 24 * 60 * 60 * 1000;
        const expirationDate = new Date(certInfo.valid_to);
        expirations[url] = `Expires in ${(expiresIn / day)} days on ${expirationDate}`;
        eachDone();
      }).on('error', (error) => {
        expirations[url] = error.toString();
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
