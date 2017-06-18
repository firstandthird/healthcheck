'use strict';

const https = require('https');
module.exports = {
  method(data) {
    const server = this;
    server.plugins.healthcheck.config.urls.forEach((config) => {
      try {
        https.get(config.url, (res) => {
          const certInfo = res.socket.getPeerCertificate();
          const expiresIn = new Date(certInfo.valid_to).getTime() - new Date().getTime();
          const oneWeek = 1000 * 60 * 60 * 24 * 7;
          if (expiresIn < oneWeek) {
            server.methods.report(data, {
              timestamp: Date.now(),
              expiresIn
            });
          }
        });
      } catch (e) {
        // do nothing
      }
    });
  }
};
