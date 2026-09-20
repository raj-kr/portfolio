const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const response = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function createHandler({ client = ses, env = process.env, logger = console } = {}) {
  return async (event, context = {}) => {
    const method = event.httpMethod || event.requestContext?.http?.method || 'POST';
    if (method === 'OPTIONS') return response(200, { message: 'CORS preflight successful' });
    if (method !== 'POST') return response(405, { success: false, error: 'Method not allowed' });

    let body = event.body ?? event;
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > 45000) return response(413, { success: false, error: 'Message is too large' });
      const json = event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
      if (Buffer.byteLength(json) > 32768) return response(413, { success: false, error: 'Message is too large' });
      try {
        body = JSON.parse(json);
      } catch {
        return response(400, { success: false, error: 'Invalid JSON in request body' });
      }
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return response(400, { success: false, error: 'Invalid form data' });
    }

    // A hidden field catches simple form-filling bots without sending mail.
    if (body.website) return response(200, { success: true, message: 'Message received.' });

    const limits = { name: 100, email: 254, message: 5000 };
    const fields = {};
    for (const [field, limit] of Object.entries(limits)) {
      if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > limit) {
        return response(400, { success: false, error: field + ' must contain 1 to ' + limit + ' characters' });
      }
      fields[field] = body[field].trim();
    }
    const { name, email, message } = fields;
    if (/[\x00-\x1f\x7f]/.test(name + email) || !/^[^\s<>"'@]+@[^\s<>"'@]+\.[^\s<>"'@]+$/.test(email)) {
      return response(400, { success: false, error: 'Invalid name or email address' });
    }

    const timestamp = new Date().toISOString();
    try {
      const result = await client.send(new SendEmailCommand({
        Source: env.FROM_EMAIL || 'mail@raj.kr',
        Destination: { ToAddresses: [env.TO_EMAIL || 'rkgt76@gmail.com'] },
        // Ignore the legacy REPLY_TO_EMAIL override: replies belong to the visitor.
        ReplyToAddresses: [email],
        Message: {
          Subject: { Data: 'Email from ' + name, Charset: 'UTF-8' },
          Body: {
            Text: {
              Data: 'New message on raj.kr\n\nName: ' + name + '\nEmail: ' + email + '\nMessage: ' + message + '\n\nSubmitted at: ' + timestamp,
              Charset: 'UTF-8',
            },
            Html: {
              Data: '<h2>New message on raj.kr</h2><p><strong>Name:</strong> ' + escapeHtml(name) +
                '</p><p><strong>Email:</strong> <a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) +
                '</a></p><p><strong>Message:</strong><br>' + escapeHtml(message).replace(/\r?\n/g, '<br>') +
                '</p><p>Submitted at: ' + timestamp + '</p>',
              Charset: 'UTF-8',
            },
          },
        },
      }));
      logger.log('Contact message accepted by SES', { requestId: context.awsRequestId, messageId: result.MessageId });
      return response(200, { success: true, message: "Message sent successfully! I'll get back to you soon." });
    } catch {
      // Provider errors can contain email addresses; log only operational metadata.
      logger.error('Contact email delivery request failed', { requestId: context.awsRequestId });
      return response(502, { success: false, error: 'Unable to send your message. Please try again later.' });
    }
  };
}

exports.createHandler = createHandler;
exports.handler = createHandler();
