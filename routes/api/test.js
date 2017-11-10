exports.testDown = {
  method: 'GET',
  path: '/api/testDown',
  handler(request, reply) {
    const data = {
      type: 'http',
      name: 'FAKE',
      url: 'aFakeUrl.com',
      responseTime: 5000,
      error: 'Response threshold',
      retries: 5,
      message: 'FAKE is down'
    };
    request.server.log(['service-down', 'blah'], data);
    reply(null, 'fake service-down log posted, make sure you got a notification for it');
  }
};
