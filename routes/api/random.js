exports.random = {
  method: 'GET',
  path: '/api/random',
  handler(request, reply) {
    const codes = [200, 404, 500, 200];
    const code = codes[Math.floor(Math.random() * codes.length)];
    reply({ statusCode: code, headers: request.headers }).code(code);
  }
};
