const wreck = require('wreck');
exports.sns = {
  path: '/sns',
  method: 'POST',
  handler(request, h) {
    const server = request.server;
    const payload = JSON.parse(request.payload);
    if (payload.Type === 'SubscriptionConfirmation') {
      try {
        wreck.get(payload.SubscribeURL);
        server.log(['sns', 'confirmation'], 'SNS Subscription Confirmed');
      } catch (err) {
        server.log(['sns', 'error'], err);
      }
    }
    let message = payload.Message;
    if (payload.Message[0] === '{') {
      message = JSON.parse(payload.Message);
      message.message = message.Event;
      delete message.Event;
    }
    server.log(['sns'], message);
    return 'ok';
  }
};
