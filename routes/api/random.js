exports.random = {
  method: 'GET',
  path: '/api/random',
  handler(request, reply) {
    const date = Date.now();
    const codes = [200, 404, 500, 200];
    const code = codes[Math.floor(Math.random() * codes.length)];
    reply({ statusCode: code }).code(code);
  }
}