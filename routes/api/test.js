exports.testDown = {
  method: 'GET',
  path: '/api/testDown',
  handler(request, reply) {
    request.server.log(['service-down', 'blah'], 'i hate you dad');
    reply(null, 'fake service-down log posted, make sure you got a notification for it');
  }
};
