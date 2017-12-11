exports.runall = {
  method: 'GET',
  path: '/api/runall',
  handler(request, h) {
    const server = request.server;

    server.methods.runall();

    return { success: true };
  }
};
