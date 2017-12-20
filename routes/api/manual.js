
exports.manual = {
  method: 'GET',
  path: '/api/cert',
  async handler(request, h) {
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
        const res = await server.methods.getFreshCertificate(url);
        expirations[url] = res;
        continue;
      } catch (err) {
        expirations[url] = err;
        continue;
      }
    }
    return expirations;
  }
};
