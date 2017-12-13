exports.all = {
  method: 'GET',
  path: '/api/all',
  handler(request, h) {
    const server = request.server;
    return server.methods.all();
  }
};
