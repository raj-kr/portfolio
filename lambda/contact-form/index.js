const AWS = require("aws-sdk");

// Initialize AWS services
const ses = new AWS.SES({ region: process.env.AWS_REGION || "us-east-1" });

// CORS headers for API Gateway
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "false",
};

/**
 * Main Lambda handler function
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} API Gateway response
 */
exports.handler = async (event, context) => {
  console.log(
    "Contact form submission received:",
    JSON.stringify(event, null, 2)
  );

  // Handle preflight CORS requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS preflight successful" }),
    };
  }

  try {
    // Parse request body - handle both direct object (Lambda test) and JSON string (API Gateway)
    let body;
    if (typeof event.body === "string") {
      try {
        body = JSON.parse(event.body);
      } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: "Invalid JSON in request body",
          }),
        };
      }
    } else {
      // Direct object input (from Lambda test console)
      body = event.body || event;
    }

    // Extract form data
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error:
            "Missing required fields: name, email, and message are required",
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Invalid email format",
        }),
      };
    }

    // Sanitize input to prevent XSS
    const sanitizeInput = (input) => {
      return input.replace(/[<>]/g, "").trim();
    };

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Get configuration from environment variables
    const fromEmail = process.env.FROM_EMAIL || "noreply@yourdomain.com";
    const toEmail = process.env.TO_EMAIL || "your-email@yourdomain.com";
    const replyToEmail = process.env.REPLY_TO_EMAIL || sanitizedEmail;

    // Prepare email content
    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      ReplyToAddresses: [replyToEmail],
      Message: {
        Subject: {
          Data: `New Contact Form Submission from ${sanitizedName}`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `
New Contact Form Submission

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Message: ${sanitizedMessage}

---
Submitted at: ${new Date().toISOString()}
IP Address: ${event.requestContext?.identity?.sourceIp || "Unknown"}
User Agent: ${event.headers?.["User-Agent"] || "Unknown"}

This message was sent from your portfolio contact form.
            `,
            Charset: "UTF-8",
          },
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    
    <div class="field">
      <div class="label">Name:</div>
      <div class="value">${sanitizedName}</div>
    </div>
    
    <div class="field">
      <div class="label">Email:</div>
      <div class="value"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></div>
    </div>
    
    <div class="field">
      <div class="label">Message:</div>
      <div class="value">${sanitizedMessage.replace(/\n/g, "<br>")}</div>
    </div>
    
    <div class="footer">
      <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>IP Address:</strong> ${
        event.requestContext?.identity?.sourceIp || "Unknown"
      }</p>
      <p><strong>User Agent:</strong> ${
        event.headers?.["User-Agent"] || "Unknown"
      }</p>
      <p><em>This message was sent from your portfolio contact form.</em></p>
    </div>
  </div>
</body>
</html>
            `,
            Charset: "UTF-8",
          },
        },
      },
    };

    // Send email using SES
    console.log(
      "Sending email with params:",
      JSON.stringify(emailParams, null, 2)
    );
    const result = await ses.sendEmail(emailParams).promise();
    console.log("Email sent successfully:", result.MessageId);

    // Log successful submission
    console.log(
      `Contact form submitted successfully by ${sanitizedName} (${sanitizedEmail})`
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: "Message sent successfully! I'll get back to you soon.",
        messageId: result.MessageId,
      }),
    };
  } catch (error) {
    console.error("Error processing contact form:", error);

    // Return appropriate error response
    const errorMessage =
      error.code === "MessageRejected"
        ? "Email was rejected. Please check your email address and try again."
        : "Failed to send message. Please try again later.";

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
      }),
    };
  }
};
