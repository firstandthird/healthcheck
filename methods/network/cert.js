'use strict';

module.exports = {
  async method(data) {
    // set the type:
    data.type = 'certification';
    const server = this;
    try {
      const res = await server.methods.getFreshCertificate(data.url);
      const expiresIn = res.expiresIn;
      if (expiresIn < data.expireMin) {
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
