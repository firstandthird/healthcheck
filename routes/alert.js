exports.alert = {
  method: 'GET',
  path: '/alert',
  handler(request, h) {
    const data = {
      type: 'http',
      name: 'FAKE',
      url: 'aFakeUrl.com',
      responseTime: 5000,
      error: 'Response threshold',
      retries: 5,
      message: 'FAKE is down'
    };
    request.server.log(['service-down', `test_${Math.random()}`], data);
    return 'fake service-down log posted, make sure you got a notification for it';
  }
};
