const https = require('node:https');

// Fill these in when your HTTPS server is ready.
const serverEndpoint = '';
const serverToken = '';

function reply(text, keepOpen = false) {
  return {
    version: '1.0',
    response: {
      outputSpeech: { type: 'PlainText', text },
      ...(keepOpen ? {
        reprompt: { outputSpeech: { type: 'PlainText', text: 'Say check status or start focus mode.' } },
      } : {}),
      shouldEndSession: !keepOpen,
    },
  };
}

function sendAction(action, requestId) {
  const body = JSON.stringify({ action, requestId });
  return new Promise((resolve, reject) => {
    const request = https.request(serverEndpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + serverToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, response => {
      response.resume();
      response.once('error', reject);
      response.once('end', () => resolve(response.statusCode >= 200 && response.statusCode < 300));
    });
    const timeout = setTimeout(() => request.destroy(new Error('Server timeout')), 3000);
    request.once('close', () => clearTimeout(timeout));
    request.once('error', reject);
    request.end(body);
  });
}

exports.handler = async ({ request }) => {
  if (request.type === 'SessionEndedRequest') return { version: '1.0', response: {} };

  const intent = request.intent?.name;
  if (request.type === 'LaunchRequest' || intent === 'AMAZON.HelpIntent') {
    return reply('Jarvis Control is ready. Say check status or start focus mode.', true);
  }
  if (intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent') {
    return reply('Goodbye.');
  }

  const action = { CheckStatusIntent: 'check_status', StartFocusIntent: 'start_focus' }[intent];
  if (!action || request.type !== 'IntentRequest') {
    return reply('Try saying check status or start focus mode.', true);
  }
  if (!serverEndpoint || !serverToken) {
    return reply('Jarvis Control is running. The control server is not configured yet.');
  }
  try {
    if (await sendAction(action, request.requestId)) {
      return reply(action === 'check_status' ? 'Your control server is online.' : 'Your control server accepted the focus command.');
    }
  } catch {
    return reply('I could not reach your control server.');
  }
  return reply('Your control server did not accept the request.');
};
