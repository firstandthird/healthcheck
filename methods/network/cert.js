'use strict';

const https = require('https');
module.exports = {
  method(data) {
    const server = this;
    try {
      https.get(data.url, (res) => {
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
  }
};
