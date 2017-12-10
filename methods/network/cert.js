'use strict';

module.exports = {
  method: async (data) => {
    // set the type:
    data.type = 'certification';
    const server = this;
    try {
      const res = await server.methods.getFreshCertificate(data.url);
      const expiresIn = res.expiresIn;
      if (expiresIn < data.expireLimit) {
        server.methods.report(data, {
          timestamp: Date.now(),
          expiresIn
        });
      }
    } catch (err) {
      return server.log(['healthcheck', 'error', 'certificate expiration check'], { url: data.url, err });
    }
  }
};
