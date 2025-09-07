#!/bin/bash

# Complete Email Forwarding Setup Script
# This script sets up the complete email forwarding system:
# 1. Deploys email processor Lambda
# 2. Sets up S3 bucket notifications
# 3. Updates SES receipt rules
# 4. Tests the system

set -e  # Exit on any error

echo "🚀 Setting up Complete Email Forwarding System"
echo "=============================================="

AWS_REGION="ap-south-1"
BUCKET_NAME="myemail-log"
FUNCTION_NAME="email-processor"
ROLE_ARN="arn:aws:iam::016116087217:role/raj.kr-LambdaRole"

echo "📋 Configuration:"
echo "  AWS Region: $AWS_REGION"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Lambda Function: $FUNCTION_NAME"
echo ""

# Step 1: Deploy the email processor Lambda
echo "1️⃣ Deploying Email Processor Lambda..."
echo "======================================"
chmod +x deploy.sh
./deploy.sh

echo ""

# Step 2: Create S3 bucket notification configuration
echo "2️⃣ Setting up S3 Bucket Notifications..."
echo "========================================"

# Create notification configuration
cat > s3-notification-config.json << EOF
{
    "LambdaConfigurations": [
        {
            "Id": "email-processor-trigger",
            "LambdaFunctionArn": "arn:aws:lambda:${AWS_REGION}:016116087217:function:${FUNCTION_NAME}",
            "Events": ["s3:ObjectCreated:*"],
            "Filter": {
                "Key": {
                    "FilterRules": [
                        {
                            "Name": "prefix",
                            "Value": "emails/"
                        }
                    ]
                }
            }
        }
    ]
}
EOF

# Apply the notification configuration
aws s3api put-bucket-notification-configuration \
    --bucket "$BUCKET_NAME" \
    --notification-configuration file://s3-notification-config.json \
    --region "$AWS_REGION"

echo "✅ S3 bucket notifications configured!"

# Step 3: Update SES receipt rules
echo ""
echo "3️⃣ Updating SES Receipt Rules..."
echo "================================"

# Create new receipt rule for email forwarding
cat > email-forwarding-rule.json << EOF
{
    "Name": "forward-emails-rule",
    "Enabled": true,
    "TlsPolicy": "Optional",
    "Recipients": ["raj.kr"],
    "Actions": [
        {
            "S3Action": {
                "BucketName": "$BUCKET_NAME",
                "ObjectKeyPrefix": "emails/"
            }
        }
    ]
}
EOF

# Update the existing rule set
aws ses update-receipt-rule \
    --rule-set-name "email-storage-ruleset" \
    --rule file://email-forwarding-rule.json \
    --region "$AWS_REGION"

echo "✅ SES receipt rules updated!"

# Step 4: Create IAM policy for email processor
echo ""
echo "4️⃣ Setting up IAM Permissions..."
echo "================================"

# Create policy for email processor
cat > email-processor-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Attach policy to Lambda role
aws iam put-role-policy \
    --role-name "raj.kr-LambdaRole" \
    --policy-name "EmailProcessorPolicy" \
    --policy-document file://email-processor-policy.json

echo "✅ IAM permissions configured!"

# Step 5: Test the system
echo ""
echo "5️⃣ Testing Email Forwarding System..."
echo "===================================="

# Create a test email file
cat > test-email.eml << EOF
From: test@example.com
To: mail@raj.kr
Subject: Test Email for Forwarding
Date: $(date -R)

This is a test email to verify the forwarding system is working.

Best regards,
Test Sender
EOF

# Upload test email to S3
aws s3 cp test-email.eml "s3://$BUCKET_NAME/emails/test-$(date +%s).eml" --region "$AWS_REGION"

echo "✅ Test email uploaded to S3!"
echo "   The Lambda function should process it and forward to Gmail"

# Clean up test files
rm -f s3-notification-config.json email-forwarding-rule.json email-processor-policy.json test-email.eml

echo ""
echo "🎉 Email Forwarding System Setup Complete!"
echo "=========================================="
echo ""
echo "📧 How it works:"
echo "1. Emails sent to any @raj.kr address are received by SES"
echo "2. SES stores the email in S3 bucket: $BUCKET_NAME"
echo "3. S3 triggers the email processor Lambda function"
echo "4. Lambda reads the email from S3 and forwards it to Gmail"
echo "5. The forwarded email has proper From/Reply-To headers"
echo ""
echo "✅ Benefits:"
echo "- Preserves full original message content"
echo "- Avoids SPF/DMARC issues with proper headers"
echo "- All emails are stored in S3 for backup"
echo "- Professional appearance in Gmail inbox"
echo ""
echo "🧪 Test the system by sending an email to mail@raj.kr"
echo "📧 Check your Gmail inbox for the forwarded message"
