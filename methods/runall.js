module.exports = {
  async method() {
    const server = this;
    const config = server.settings.app;
    if (!config.urls) {
      throw new Error('No URLs specified in configuration');
    }
    config.urls.forEach(url => {
      const data = {
        name: url.name || url.url,
        url: url.url,
        type: url.type || 'http',
        statusCode: url.statusCode || 200,
        responseThreshold: url.responseThreshold || config.responseThreshold || 1000,
        timeout: url.timeout || config.timeout || 10000,
        retryDelay: url.retryDelay || config.retryDelay || 1000,
        retryCount: url.retryCount || config.retryCount || 1,
        checkCount: 0
      };

      server.methods.checkurl(data);
    });
  }
};
