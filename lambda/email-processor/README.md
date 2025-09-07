# Email Processor Lambda Function

This Lambda function processes incoming emails stored in S3 and forwards them to Gmail with proper headers to avoid SPF/DMARC issues.

## How It Works

1. **Email Reception**: Emails sent to any `@raj.kr` address are received by AWS SES
2. **S3 Storage**: SES stores the email in the `myemail-log` S3 bucket
3. **S3 Trigger**: S3 bucket notification triggers this Lambda function
4. **Email Processing**: Lambda reads the email from S3 and parses it
5. **Email Forwarding**: Lambda forwards the email to Gmail with proper headers:
   - **From**: `mail@raj.kr` (verified domain)
   - **Reply-To**: Original sender's email
   - **Subject**: `[FWD: Original Subject]`

## Benefits

- ✅ **Preserves Full Message**: Complete original email content is preserved
- ✅ **Avoids SPF/DMARC Issues**: Uses verified domain for From header
- ✅ **Professional Appearance**: Looks like direct emails in Gmail
- ✅ **S3 Backup**: All emails are stored in S3 for backup
- ✅ **Multiple Email Support**: Any `*@raj.kr` email works

## Files

- `index.js` - Main Lambda function code
- `package.json` - Dependencies and scripts
- `deploy.sh` - Deployment script
- `setup-email-forwarding.sh` - Complete system setup
- `test.js` - Test script

## Dependencies

- `aws-sdk` - AWS SDK for JavaScript
- `mailparser` - Email parsing library

## Environment Variables

- `AWS_REGION` - AWS region (default: ap-south-1)
- `FROM_EMAIL` - Email address to send from (default: mail@raj.kr)
- `TO_EMAIL` - Email address to send to (default: rkgt76@gmail.com)

## Deployment

### Quick Setup
```bash
chmod +x setup-email-forwarding.sh
./setup-email-forwarding.sh
```

### Manual Deployment
```bash
# Install dependencies
npm install

# Deploy Lambda function
chmod +x deploy.sh
./deploy.sh

# Set up S3 notifications and SES rules
# (See setup-email-forwarding.sh for details)
```

## Testing

```bash
# Test the Lambda function locally
node test.js

# Test with real S3 trigger
aws s3 cp test-email.eml s3://myemail-log/emails/test-$(date +%s).eml
```

## Email Flow

```
External Email → SES → S3 → Lambda → Gmail
     ↓              ↓     ↓      ↓
  any@raj.kr   Store .eml  Parse  Forward with
                      file  email  proper headers
```

## IAM Permissions Required

The Lambda execution role needs:
- `s3:GetObject` on `myemail-log/*`
- `ses:SendEmail` and `ses:SendRawEmail` on `*`

## Troubleshooting

1. **Check CloudWatch Logs**: Look for error messages
2. **Verify S3 Permissions**: Ensure Lambda can read from S3
3. **Check SES Permissions**: Ensure Lambda can send emails
4. **Test S3 Trigger**: Upload a test file to trigger the function

## Example Forwarded Email

```
From: mail@raj.kr
Reply-To: original-sender@example.com
Subject: [FWD: Original Subject]

---------- Forwarded message ---------
From: original-sender@example.com
To: mail@raj.kr
Date: Mon, 6 Sep 2025 14:30:00 +0000
Subject: Original Subject

Original email content here...

---------- End of forwarded message ---------
```
