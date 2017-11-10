exports.testDown = {
  method: 'GET',
  path: '/api/testDown',
  handler(request, reply) {
    const result = {
      timestamp: Date.now(),
      responseTime: 5000,
      error: null,
      up: false,
      slow: false
    };
    request.server.log(['service-down', 'blah'], result);
    reply(null, 'fake service-down log posted, make sure you got a notification for it');
  }
};
