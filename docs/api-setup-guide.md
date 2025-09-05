# API Gateway & Lambda Setup Guide

This guide shows how to set up AWS API Gateway and Lambda to handle contact form submissions from your Vite React portfolio.

## 🏗️ Architecture Overview

```
React App → API Gateway → Lambda Function → Email Service (SES) / Database
```

## 📋 Prerequisites

- AWS Account
- AWS CLI configured
- Node.js installed (for Lambda function)

## 🚀 Step 1: Create Lambda Function

### 1.1 Create the Lambda Function

```bash
# Create a new directory for your Lambda function
mkdir contact-form-lambda
cd contact-form-lambda

# Initialize npm
npm init -y

# Install dependencies
npm install aws-sdk
```

### 1.2 Create the Lambda Handler

Create `index.js`:

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' }); // Change to your preferred region

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  try {
    // Parse the request body
    const { name, email, message } = JSON.parse(event.body);
    
    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: name, email, and message are required'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }

    // Send email using SES
    const emailParams = {
      Source: 'your-email@domain.com', // Your verified email in SES
      Destination: {
        ToAddresses: ['your-email@domain.com'] // Where to send the contact form
      },
      Message: {
        Subject: {
          Data: `New Contact Form Submission from ${name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: `
Name: ${name}
Email: ${email}
Message: ${message}

---
Sent from your portfolio contact form
            `,
            Charset: 'UTF-8'
          },
          Html: {
            Data: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
<hr>
<p><em>Sent from your portfolio contact form</em></p>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    await ses.sendEmail(emailParams).promise();

    // Log the submission (optional)
    console.log(`Contact form submitted by ${name} (${email})`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully! I\'ll get back to you soon.'
      })
    };

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send message. Please try again later.'
      })
    };
  }
};
```

### 1.3 Deploy Lambda Function

```bash
# Create deployment package
zip -r contact-form-lambda.zip index.js node_modules/

# Deploy using AWS CLI
aws lambda create-function \
  --function-name contact-form-handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://contact-form-lambda.zip \
  --region us-east-1
```

## 🌐 Step 2: Create API Gateway

### 2.1 Create REST API

```bash
# Create API Gateway
aws apigateway create-rest-api \
  --name "Portfolio Contact API" \
  --description "API for portfolio contact form" \
  --region us-east-1
```

### 2.2 Get API ID and Root Resource ID

```bash
# Get API ID
aws apigateway get-rest-apis --query 'items[?name==`Portfolio Contact API`].id' --output text

# Get root resource ID
aws apigateway get-resources --rest-api-id YOUR_API_ID --query 'items[?path==`/`].id' --output text
```

### 2.3 Create Contact Resource

```bash
# Create /contact resource
aws apigateway create-resource \
  --rest-api-id YOUR_API_ID \
  --parent-id YOUR_ROOT_RESOURCE_ID \
  --path-part contact
```

### 2.4 Create POST Method

```bash
# Create POST method
aws apigateway put-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_CONTACT_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE
```

### 2.5 Configure Lambda Integration

```bash
# Set up Lambda integration
aws apigateway put-integration \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_CONTACT_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:contact-form-handler/invocations
```

### 2.6 Deploy API

```bash
# Deploy API to stage
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

## ⚙️ Step 3: Configure Frontend

### 3.1 Update API Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  production: {
    baseUrl: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod',
    contactEndpoint: '/contact',
  },
  // ... other configs
};
```

### 3.2 Set Environment Variables

Create `.env.local`:

```bash
# For production deployment
VITE_API_KEY=your-api-key-if-needed
```

### 3.3 Update GitHub Secrets

Add to your GitHub repository secrets:

- `VITE_API_KEY`: Your API Gateway key (if using API keys)

## 🔧 Step 4: Configure AWS SES

### 4.1 Verify Email Addresses

```bash
# Verify your email address
aws ses verify-email-identity --email-address your-email@domain.com

# Verify domain (optional but recommended)
aws ses verify-domain-identity --domain yourdomain.com
```

### 4.2 Request Production Access (if needed)

If you're not in the SES sandbox, you may need to request production access to send emails to unverified addresses.

## 🧪 Step 5: Testing

### 5.1 Test Lambda Function

```bash
# Test the Lambda function directly
aws lambda invoke \
  --function-name contact-form-handler \
  --payload '{"httpMethod":"POST","body":"{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Test message\"}"}' \
  response.json
```

### 5.2 Test API Gateway

```bash
# Test the API Gateway endpoint
curl -X POST \
  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/contact \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message from API Gateway"
  }'
```

### 5.3 Test Frontend Integration

1. Start your development server: `npm run dev`
2. Click the Contact button in the navigation
3. Fill out the form and submit
4. Check your email for the message

## 🔒 Step 6: Security Considerations

### 6.1 API Key (Optional)

If you want to add API key authentication:

```bash
# Create API key
aws apigateway create-api-key \
  --name "Portfolio Contact API Key" \
  --description "API key for portfolio contact form"

# Create usage plan
aws apigateway create-usage-plan \
  --name "Portfolio Contact Usage Plan" \
  --description "Usage plan for portfolio contact API" \
  --api-stages apiId=YOUR_API_ID,stage=prod
```

### 6.2 Rate Limiting

Consider implementing rate limiting to prevent spam:

```bash
# Add throttling to usage plan
aws apigateway update-usage-plan \
  --usage-plan-id YOUR_USAGE_PLAN_ID \
  --patch-ops op=replace,path=/throttle/rateLimit,value=10,op=replace,path=/throttle/burstLimit,value=20
```

### 6.3 CORS Configuration

The Lambda function already includes CORS headers, but you can also configure CORS at the API Gateway level if needed.

## 📊 Step 7: Monitoring & Logging

### 7.1 CloudWatch Logs

Monitor your Lambda function logs:

```bash
# View recent logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/contact-form-handler
```

### 7.2 API Gateway Metrics

Monitor API Gateway metrics in the AWS Console:

- Request count
- Latency
- Error rates
- Cache hit/miss ratios

## 🚀 Step 8: Deployment

### 8.1 Update CI/CD

Your existing GitHub Actions workflow will automatically deploy the updated frontend with the new contact form functionality.

### 8.2 Environment Variables

Make sure to set the `VITE_API_KEY` environment variable in your production deployment platform.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS headers are properly set in Lambda
2. **Lambda Permissions**: Make sure Lambda has permission to invoke SES
3. **SES Sandbox**: Verify email addresses if in SES sandbox mode
4. **API Gateway Integration**: Check that the integration is set to AWS_PROXY

### Debug Commands

```bash
# Check Lambda function logs
aws logs tail /aws/lambda/contact-form-handler --follow

# Test API Gateway
aws apigateway test-invoke-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method POST \
  --path-with-query-string /contact \
  --body '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [SES Documentation](https://docs.aws.amazon.com/ses/)
- [CORS Configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
