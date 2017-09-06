'use strict';

module.exports = {
  method(data) {
    // set the type:
    data.type = 'certification';
    const server = this;
    server.methods.getFreshCertificate(data.url, (err, res) => {
      if (err) {
        return server.log(['healthcheck', 'error', 'certificate expiration check'], { url: data.url, err });
      }
      const expiresIn = res.expiresIn;
      if (expiresIn < data.expireLimit) {
        server.methods.report(data, {
          timestamp: Date.now(),
          expiresIn
        });
      }
    });
  }
};
