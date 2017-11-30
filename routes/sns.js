const wreck = require('wreck');
exports.sns = {
  path: '/sns',
  method: 'POST',
  handler(request, reply) {
    const server = request.server;
    const payload = JSON.parse(request.payload);
    if (payload.Type === 'SubscriptionConfirmation') {
      wreck.get(payload.SubscribeURL, (err, res, p) => {
        if (err) {
          server.log(['sns', 'error'], err);
          return;
        }
        server.log(['sns', 'confirmation'], 'SNS Subscription Confirmed');
      });
      return;
    }
    let message = payload.Message;
    if (payload.Message[0] === '{') {
      message = JSON.parse(payload.Message);
      message.message = message.Event;
      delete message.Event;
    }
    server.log(['sns'], message);
    reply(null, 'ok');
  }
};
