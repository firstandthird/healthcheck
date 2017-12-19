const async = require('async');

exports.manual = {
  method: 'GET',
  path: '/api/cert',
  handler(request, h) {
    const server = request.server;
    const config = server.settings.app;
    const expirations = {};
    if (!config.urls) {
      throw new Error('No URLs specified in configuration');
    }
    for (let i = 0; i < config.urls.length; i++) {
      const obj = config.urls[i];
      const url = obj.url;
      if (!url.startsWith('https:')) {
        continue;
      }
      try {
        const res = server.methods.getFreshCertificate(url);
        const day = 24 * 60 * 60 * 1000;
        expirations[url] = `Expires in ${(res.expiresIn / day).toFixed(1)} days on ${res.expiresOn}`;
        continue;
      } catch (err) {
        expirations[url] = err;
        continue;
      }
    }
    return expirations;
  }
};
