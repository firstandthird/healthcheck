exports.random = {
  method: 'GET',
  path: '/api/random',
  handler(request, h) {
    const codes = [200, 404, 500, 200];
    const code = codes[Math.floor(Math.random() * codes.length)];
    return h.response({ statusCode: code, headers: request.headers }).code(code);
  }
};
