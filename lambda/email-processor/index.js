const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

const region = process.env.AWS_REGION || 'ap-south-1';
const s3 = new S3Client({ region });
const ses = new SESClient({ region });
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
// Compose MIME locally; only the SES client sends over the network.
const composer = nodemailer.createTransport({
  streamTransport: true, buffer: true, newline: 'windows',
  disableFileAccess: true, disableUrlAccess: true,
});

function createHandler({ storage = s3, sender = ses, env = process.env, logger = console } = {}) {
  return async (event, context = {}) => {
    try {
      if (!Array.isArray(event.Records)) throw new Error('Invalid S3 event');
      for (const record of event.Records) {
        if (record.eventSource !== 'aws:s3') continue;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        const object = await storage.send(new GetObjectCommand({
          Bucket: record.s3.bucket.name, Key: key,
          ...(record.s3.object.versionId ? { VersionId: record.s3.object.versionId } : {}),
        }));
        const email = await simpleParser(object.Body, { skipImageLinks: true });
        const from = env.FROM_EMAIL || 'mail@raj.kr';
        const to = env.TO_EMAIL || 'rkgt76@gmail.com';
        const replyTo = email.replyTo?.value?.[0]?.address || email.from?.value?.[0]?.address;
        const originalHeader = 'Forwarded message\nFrom: ' + (email.from?.text || 'Unknown sender') +
          '\nTo: ' + (email.to?.text || 'Unknown recipient') + '\nSubject: ' + (email.subject || 'No subject');
        const { message } = await composer.sendMail({
          from, to, replyTo,
          subject: '[FWD: ' + (email.subject || 'No Subject') + ']',
          text: originalHeader + '\n\n' + (email.text || 'This message contains HTML content or attachments.'),
          html: email.html ? '<pre>' + escapeHtml(originalHeader) + '</pre>' + email.html : undefined,
          attachments: email.attachments.map(attachment => ({
            filename: attachment.filename || 'attachment',
            content: attachment.content,
            contentType: attachment.contentType,
            contentDisposition: attachment.contentDisposition,
            cid: attachment.contentId?.replace(/^<|>$/g, ''),
          })),
        });
        // SES SendRawEmail accepts at most 10 MB, including MIME encoding.
        if (message.length > 10 * 1024 * 1024) throw new Error('Forward exceeds SES size limit');
        const result = await sender.send(new SendRawEmailCommand({
          Source: from, Destinations: [to], RawMessage: { Data: message },
        }));
        logger.log('Forward accepted by SES', { requestId: context.awsRequestId, messageId: result.MessageId });
      }
      return { success: true };
    } catch {
      logger.error('Email forwarding failed', { requestId: context.awsRequestId });
      // S3 invokes asynchronously: throwing activates retries and failure destinations.
      throw new Error('Email forwarding failed; original message remains in S3');
    }
  };
}

exports.createHandler = createHandler;
exports.handler = createHandler();
