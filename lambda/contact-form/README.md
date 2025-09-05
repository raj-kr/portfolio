# Contact Form Lambda Function

This Lambda function handles contact form submissions from your portfolio website and sends emails via AWS SES.

## 📁 Project Structure

```
lambda/contact-form/
├── index.js              # Main Lambda handler
├── package.json          # Dependencies and scripts
├── test.js              # Local testing script
├── deploy.sh            # Deployment script
├── README.md            # This file
└── contact-form-lambda.zip # Built deployment package (generated)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd lambda/contact-form
npm install
```

### Windows-Specific Notes

If you're on Windows, you have multiple deployment options:

1. **Git Bash** (Recommended): Use `./deploy_windows.sh`
2. **Command Prompt**: Use `deploy_windows.bat`
3. **PowerShell**: Use `.\deploy_windows.ps1`

All scripts handle Windows-specific zip creation using PowerShell's `Compress-Archive` cmdlet.

### 2. Configure Environment Variables

Set these environment variables before deployment:

```bash
export FUNCTION_NAME="contact-form-handler"
export AWS_REGION="us-east-1"
export ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
export FROM_EMAIL="noreply@yourdomain.com"
export TO_EMAIL="your-email@yourdomain.com"
export REPLY_TO_EMAIL="your-email@yourdomain.com"
```

### 3. Deploy to AWS

**Linux/Mac:**
```bash
./deploy.sh
```

**Windows (Git Bash):**
```bash
./deploy_windows.sh
```

**Windows (Command Prompt):**
```cmd
deploy_windows.bat
```

**Windows (PowerShell):**
```powershell
.\deploy_windows.ps1
# Or with parameters:
.\deploy_windows.ps1 -FunctionName "contact-form-handler" -AwsRegion "ap-south-1" -RoleArn "arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
```

**Using npm scripts:**
```bash
# Linux/Mac
npm run build && npm run deploy

# Windows (Git Bash)
npm run build:windows && npm run deploy:windows

# Windows (Command Prompt)
npm run build:windows && npm run deploy:windows:bat

# Windows (PowerShell)
npm run build:windows && npm run deploy:windows:ps1
```

**Manual deployment:**
```bash
# Linux/Mac
npm run build
aws lambda update-function-code --function-name contact-form-handler --zip-file fileb://contact-form-lambda.zip

# Windows
npm run build:windows
aws lambda update-function-code --function-name contact-form-handler --zip-file fileb://contact-form-lambda.zip
```

### 4. Test Locally

```bash
npm test
```

## ⚙️ Configuration

### Environment Variables

| Variable         | Description             | Required | Default                     |
| ---------------- | ----------------------- | -------- | --------------------------- |
| `AWS_REGION`     | AWS region for SES      | No       | `us-east-1`                 |
| `FROM_EMAIL`     | Sender email address    | Yes      | `noreply@yourdomain.com`    |
| `TO_EMAIL`       | Recipient email address | Yes      | `your-email@yourdomain.com` |
| `REPLY_TO_EMAIL` | Reply-to email address  | Yes      | `your-email@yourdomain.com` |

### IAM Permissions

Your Lambda execution role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 📧 Email Configuration

### SES Setup

1. **Verify Email Addresses**:
   ```bash
   aws ses verify-email-identity --email-address your-email@yourdomain.com
   aws ses verify-email-identity --email-address noreply@yourdomain.com
   ```

2. **Verify Domain** (recommended):
   ```bash
   aws ses verify-domain-identity --domain yourdomain.com
   ```

3. **Request Production Access** (if needed):
   - Go to AWS SES Console
   - Request production access to send emails to unverified addresses

### Email Templates

The function sends both HTML and text versions of the email with:
- Contact form data (name, email, message)
- Submission timestamp
- IP address and user agent
- Professional formatting

## 🧪 Testing

### Local Testing

```bash
npm test
```

This runs several test scenarios:
- Valid form submission
- Invalid email format
- Missing required fields
- CORS preflight request

### Manual Testing

Test with curl:

```bash
curl -X POST https://your-api-gateway-url.amazonaws.com/prod/contact \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

## 🔧 Development

### Project Structure

- **`index.js`**: Main Lambda handler with email sending logic
- **`test.js`**: Local testing script with mock events
- **`deploy.sh`**: Automated deployment script
- **`package.json`**: Dependencies and build scripts

### Key Features

- **Input Validation**: Validates required fields and email format
- **XSS Protection**: Sanitizes user input
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Handles preflight requests
- **Dual Email Format**: Sends both HTML and text versions
- **Logging**: Detailed CloudWatch logging

### Customization

To customize the email template, modify the `emailParams` object in `index.js`:

```javascript
const emailParams = {
  Source: fromEmail,
  Destination: { ToAddresses: [toEmail] },
  ReplyToAddresses: [replyToEmail],
  Message: {
    Subject: { Data: 'Your Custom Subject' },
    Body: {
      Text: { Data: 'Your custom text template' },
      Html: { Data: 'Your custom HTML template' }
    }
  }
};
```

## 📊 Monitoring

### CloudWatch Logs

View function logs:

```bash
aws logs tail /aws/lambda/contact-form-handler --follow
```

### Metrics

Monitor these CloudWatch metrics:
- **Invocations**: Number of function calls
- **Errors**: Number of failed executions
- **Duration**: Execution time
- **Throttles**: Number of throttled invocations

### Alarms

Set up CloudWatch alarms for:
- High error rate
- Long execution times
- Function throttling

## 🚨 Troubleshooting

### Common Issues

1. **SES Email Rejected**:
   - Verify email addresses in SES
   - Check if you're in SES sandbox mode
   - Ensure proper IAM permissions

2. **CORS Errors**:
   - Verify CORS headers in response
   - Check API Gateway CORS configuration

3. **Function Timeout**:
   - Increase timeout in function configuration
   - Check for infinite loops or blocking operations

4. **Permission Denied**:
   - Verify IAM role has required permissions
   - Check SES policy configuration

### Debug Commands

```bash
# View function configuration
aws lambda get-function --function-name contact-form-handler

# View function logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/contact-form-handler

# Test function with sample event
aws lambda invoke --function-name contact-form-handler --payload file://test-event.json response.json
```

## 🔄 Updates

### Updating the Function

1. Make your changes to `index.js`
2. Run `npm run build` to create new deployment package
3. Run `./deploy.sh` to deploy updates

### Version Management

```bash
# Publish new version
aws lambda publish-version --function-name contact-form-handler

# Create alias
aws lambda create-alias --function-name contact-form-handler --name production --function-version 1
```

## 📚 Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Node.js AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/)

## 📝 License

MIT License - see the main project LICENSE file for details.
