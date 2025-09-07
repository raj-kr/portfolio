const AWS = require("aws-sdk");
const { simpleParser } = require("mailparser");

// Initialize AWS services
const s3 = new AWS.S3({ region: process.env.AWS_REGION || "ap-south-1" });
const ses = new AWS.SES({ region: process.env.AWS_REGION || "ap-south-1" });

/**
 * Email Processor Lambda Function
 * Processes incoming emails stored in S3 and forwards them to Gmail
 * with proper From/Reply-To headers to avoid SPF/DMARC issues
 */
exports.handler = async (event, context) => {
  console.log("Email processor triggered:", JSON.stringify(event, null, 2));

  try {
    // Process each S3 record
    for (const record of event.Records) {
      if (record.eventSource === "aws:s3") {
        await processEmailFromS3(record.s3);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email processing completed successfully",
      }),
    };
  } catch (error) {
    console.error("Error processing emails:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Process email from S3 bucket
 */
async function processEmailFromS3(s3Record) {
  const bucket = s3Record.bucket.name;
  const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

  console.log(`Processing email from S3: ${bucket}/${key}`);

  try {
    // Get the email file from S3
    const emailObject = await s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    // Parse the email
    const email = await simpleParser(emailObject.Body);

    console.log("Parsed email:", {
      from: email.from?.text,
      to: email.to?.text,
      subject: email.subject,
      date: email.date,
    });

    // Forward the email to Gmail with proper headers
    await forwardEmailToGmail(email, key);

    console.log(`Successfully processed email: ${key}`);
  } catch (error) {
    console.error(`Error processing email ${key}:`, error);
    throw error;
  }
}

/**
 * Forward email to Gmail with proper headers
 */
async function forwardEmailToGmail(email, originalKey) {
  const fromEmail = process.env.FROM_EMAIL || "mail@raj.kr";
  const toEmail = process.env.TO_EMAIL || "rkgt76@gmail.com";
  const originalFrom = email.from?.text || "Unknown Sender";
  const originalTo = email.to?.text || "Unknown Recipient";

  // Extract original sender email for Reply-To
  const replyToEmail = extractEmailAddress(originalFrom);

  // Create forwarded subject
  const forwardedSubject = `[FWD: ${email.subject || "No Subject"}]`;

  // Create email content
  const textContent = createForwardedTextContent(email, originalKey);
  const htmlContent = createForwardedHtmlContent(email, originalKey);

  const emailParams = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    ReplyToAddresses: [replyToEmail],
    Message: {
      Subject: {
        Data: forwardedSubject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: textContent,
          Charset: "UTF-8",
        },
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
      },
    },
  };

  console.log("Forwarding email with params:", {
    Source: emailParams.Source,
    Destination: emailParams.Destination,
    ReplyToAddresses: emailParams.ReplyToAddresses,
    Subject: emailParams.Message.Subject.Data,
  });

  const result = await ses.sendEmail(emailParams).promise();
  console.log("Email forwarded successfully:", result.MessageId);

  return result;
}

/**
 * Extract email address from a string
 */
function extractEmailAddress(emailString) {
  if (!emailString) return "noreply@raj.kr";

  const emailRegex = /<([^>]+)>/;
  const match = emailString.match(emailRegex);

  if (match) {
    return match[1];
  }

  // If no angle brackets, try to extract email from the string
  const simpleEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = emailString.match(simpleEmailRegex);

  return emailMatch ? emailMatch[1] : "noreply@raj.kr";
}

/**
 * Create forwarded text content
 */
function createForwardedTextContent(email, originalKey) {
  const originalFrom = email.from?.text || "Unknown Sender";
  const originalTo = email.to?.text || "Unknown Recipient";
  const originalDate = email.date
    ? new Date(email.date).toLocaleString()
    : "Unknown Date";
  const originalSubject = email.subject || "No Subject";

  return `
---------- Forwarded message ---------
From: ${originalFrom}
To: ${originalTo}
Date: ${originalDate}
Subject: ${originalSubject}

${email.text || email.textAsHtml || "No text content available"}

---------- End of forwarded message ---------

Original email stored in S3: ${originalKey}
Processed at: ${new Date().toISOString()}
  `.trim();
}

/**
 * Create forwarded HTML content
 */
function createForwardedHtmlContent(email, originalKey) {
  const originalFrom = email.from?.text || "Unknown Sender";
  const originalTo = email.to?.text || "Unknown Recipient";
  const originalDate = email.date
    ? new Date(email.date).toLocaleString()
    : "Unknown Date";
  const originalSubject = email.subject || "No Subject";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Forwarded Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .forwarded-header { 
      background-color: #f4f4f4; 
      padding: 15px; 
      border-left: 4px solid #007cba; 
      margin-bottom: 20px; 
      border-radius: 3px;
    }
    .forwarded-info { 
      font-size: 12px; 
      color: #666; 
      margin-bottom: 10px; 
    }
    .original-content { 
      border: 1px solid #ddd; 
      padding: 15px; 
      background-color: #fafafa; 
      border-radius: 3px;
    }
    .footer { 
      margin-top: 20px; 
      padding-top: 15px; 
      border-top: 1px solid #eee; 
      font-size: 11px; 
      color: #888; 
    }
  </style>
</head>
<body>
  <div class="forwarded-header">
    <div class="forwarded-info">
      <strong>Forwarded message</strong>
    </div>
    <div><strong>From:</strong> ${originalFrom}</div>
    <div><strong>To:</strong> ${originalTo}</div>
    <div><strong>Date:</strong> ${originalDate}</div>
    <div><strong>Subject:</strong> ${originalSubject}</div>
  </div>
  
  <div class="original-content">
    ${email.html || email.textAsHtml || email.text || "No content available"}
  </div>
  
  <div class="footer">
    <p>Original email stored in S3: ${originalKey}</p>
    <p>Processed at: ${new Date().toISOString()}</p>
  </div>
</body>
</html>
  `.trim();
}
