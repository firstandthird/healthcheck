exports.runall = {
  method: 'GET',
  path: '/api/runall',
  handler(request, reply) {
    const server = request.server;

    server.methods.runall();

    reply({ success: true });
  }
}
