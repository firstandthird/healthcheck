exports.testDown = {
  method: 'GET',
  path: '/api/testDown',
  handler(request, reply) {
    const data = {
      averageResponse: 5000,
      minResponse: 5000,
      maxResponse: 5000,
      result: {
        timestamp: Date.now(),
        responseTime: 5000,
        error: 'Response threshold',
        up: false,
        slow: true
      }
    };
    request.server.log(['service-down', 'blah'], data);
    reply(null, 'fake service-down log posted, make sure you got a notification for it');
  }
};
