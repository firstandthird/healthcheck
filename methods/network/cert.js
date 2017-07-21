'use strict';

const https = require('https');
module.exports = {
  method(data) {
    // set the type:
    data.type = 'certification';
    const server = this;
    https.get(data.url, (res) => {
      try {
        const certInfo = res.socket.getPeerCertificate();
        const expiresIn = new Date(certInfo.valid_to).getTime() - new Date().getTime();
        if (expiresIn < data.expireLimit) {
          server.methods.report(data, {
            timestamp: Date.now(),
            expiresIn
          });
        }
      } catch (error) {
        server.log(['healthcheck', 'error', 'certificate expiration check'], { data, error });
      }
    }).on('error', (error) => {
      server.log(['healthcheck', 'error', 'certificate expiration check'], { data, error });
    });
  }
};
