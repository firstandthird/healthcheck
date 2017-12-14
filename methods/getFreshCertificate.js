const https = require('https');
module.exports = {
  method(url) {
    return new Promise((resolve, reject) => {
      let requestUrl = url.startsWith('https://') ? url.replace('https://', '') : url;
      requestUrl = requestUrl.split('/')[0];
      const options = {
        hostname: requestUrl,
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
          reject(e);
        }
      });
      req.on('socket', (socket) => {
        socket.on('secureConnect', () => {
          const certInfo = socket.getPeerCertificate();
          resolve({
            expiresIn: new Date(certInfo.valid_to).getTime() - new Date().getTime(),
            expiresOn: new Date(certInfo.valid_to)
          });
          return req.abort();
        });
      });
    });
  }
};
