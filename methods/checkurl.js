module.exports = {
  method(data, done) {
    const server = this;
    switch (data.type) {
      case 'ping':
        server.methods.network.ping(data);
        break;
      case 'http':
        server.methods.network.http(data);
        break;
      case 'cert':
        server.methods.network.cert(data);
        break;
    }
    done();
  }
};
