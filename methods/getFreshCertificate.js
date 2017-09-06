const https = require('https');

module.exports = {
  method(url, done) {
    const options = {
      hostname: url,
      port: 443,
      method: 'GET',
      headers: {
        'User-Agent': 'Node/https'
      },
      //disable session caching   (ノ°Д°）ノ︵ ┻━┻
      agent: new https.Agent({
        maxCachedSessions: 0
      })
    };
    const req = https.request(options);
    req.on('error', (e) => {
      if (e.code !== 'ECONNRESET') {
        return done(e);
      }
    });
    req.on('socket', (socket) => {
      socket.on('secureConnect', () => {
        const certInfo = socket.getPeerCertificate();
        done(null, {
          expiresIn: new Date(certInfo.valid_to).getTime() - new Date().getTime(),
          expiresOn: new Date(certInfo.valid_to)
        });
        return req.abort();
      });
    });
  }
};
