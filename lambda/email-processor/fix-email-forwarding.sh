#!/bin/bash

# Fix Email Forwarding System
# This script diagnoses and fixes issues with the email forwarding system

echo "🔧 Fixing Email Forwarding System"
echo "================================="

AWS_REGION="ap-south-1"
BUCKET_NAME="myemail-log"
FUNCTION_NAME="email-processor"

echo "📋 Current Configuration:"
echo "  AWS Region: $AWS_REGION"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Lambda Function: $FUNCTION_NAME"
echo ""

# Step 1: Check if Lambda function exists and is working
echo "1️⃣ Checking Lambda Function..."
echo "==============================="
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "✅ Lambda function exists"
    
    # Test the function
    echo "🧪 Testing Lambda function..."
    aws lambda invoke --function-name "$FUNCTION_NAME" --payload '{"Records":[{"eventSource":"aws:s3","s3":{"bucket":{"name":"myemail-log"},"object":{"key":"emails/test-1757194770.eml"}}}]}' test-response.json --region "$AWS_REGION"
    
    if [ -f test-response.json ]; then
        echo "📋 Lambda response:"
        cat test-response.json
        echo ""
    fi
else
    echo "❌ Lambda function not found"
    echo "Deploying Lambda function..."
    ./deploy.sh
fi

# Step 2: Check S3 bucket and permissions
echo ""
echo "2️⃣ Checking S3 Bucket..."
echo "========================"
if aws s3 ls "s3://$BUCKET_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "✅ S3 bucket exists"
    
    # Check bucket policy
    echo "📋 Current bucket policy:"
    aws s3api get-bucket-policy --bucket "$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null || echo "No bucket policy found"
    echo ""
else
    echo "❌ S3 bucket not found"
    echo "Creating S3 bucket..."
    aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
fi

# Step 3: Fix S3 bucket policy for SES
echo ""
echo "3️⃣ Fixing S3 Bucket Policy..."
echo "============================="

# Create correct S3 bucket policy
cat > s3-bucket-policy-fixed.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSESPuts",
            "Effect": "Allow",
            "Principal": {
                "Service": "ses.amazonaws.com"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        },
        {
            "Sid": "AllowSESToVerifyBucket",
            "Effect": "Allow",
            "Principal": {
                "Service": "ses.amazonaws.com"
            },
            "Action": "s3:GetBucketAcl",
            "Resource": "arn:aws:s3:::$BUCKET_NAME"
        }
    ]
}
EOF

# Apply the bucket policy
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://s3-bucket-policy-fixed.json --region "$AWS_REGION"
echo "✅ S3 bucket policy updated"

# Step 4: Create new SES receipt rule set
echo ""
echo "4️⃣ Creating SES Receipt Rule Set..."
echo "==================================="

# Delete existing rule set if it exists
aws ses delete-receipt-rule-set --rule-set-name "email-forwarding-ruleset" --region "$AWS_REGION" 2>/dev/null || true

# Create new rule set
aws ses create-receipt-rule-set --rule-set-name "email-forwarding-ruleset" --region "$AWS_REGION"

# Create receipt rule for email forwarding
cat > email-forwarding-rule-fixed.json << EOF
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

# Create the rule
aws ses create-receipt-rule --rule-set-name "email-forwarding-ruleset" --rule file://email-forwarding-rule-fixed.json --region "$AWS_REGION"

# Activate the rule set
aws ses set-active-receipt-rule-set --rule-set-name "email-forwarding-ruleset" --region "$AWS_REGION"

echo "✅ SES receipt rule set created and activated"

# Step 5: Update S3 notification configuration
echo ""
echo "5️⃣ Updating S3 Notifications..."
echo "==============================="

# Create notification configuration
cat > s3-notification-config-fixed.json << EOF
{
    "LambdaFunctionConfigurations": [
        {
            "Id": "email-processor-trigger",
            "LambdaFunctionArn": "arn:aws:lambda:$AWS_REGION:016116087217:function:$FUNCTION_NAME",
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
aws s3api put-bucket-notification-configuration --bucket "$BUCKET_NAME" --notification-configuration file://s3-notification-config-fixed.json --region "$AWS_REGION"

echo "✅ S3 notifications configured"

# Step 6: Test the complete system
echo ""
echo "6️⃣ Testing Complete System..."
echo "============================="

# Create a test email
cat > test-email-complete.eml << EOF
From: test@example.com
To: mail@raj.kr
Subject: Test Email for Forwarding System
Date: $(date -R)
Content-Type: text/plain; charset=UTF-8

This is a test email to verify the complete forwarding system is working.

The system should:
1. Receive this email via SES
2. Store it in S3 bucket
3. Trigger Lambda function
4. Forward to Gmail with proper headers

Best regards,
Test Sender
EOF

# Upload test email to S3
echo "📧 Uploading test email to S3..."
aws s3 cp test-email-complete.eml "s3://$BUCKET_NAME/emails/test-complete-$(date +%s).eml" --region "$AWS_REGION"

echo "✅ Test email uploaded to S3"
echo "   The Lambda function should process it and forward to Gmail"

# Step 7: Check system status
echo ""
echo "7️⃣ System Status Check..."
echo "========================="

echo "📋 Active Receipt Rule Set:"
aws ses describe-active-receipt-rule-set --region "$AWS_REGION" --query 'RuleSet.Name' --output text 2>/dev/null || echo "None"

echo ""
echo "📋 S3 Bucket Contents:"
aws s3 ls "s3://$BUCKET_NAME/emails/" --region "$AWS_REGION" | tail -5

echo ""
echo "📋 Lambda Function Status:"
aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --region "$AWS_REGION" --query '{FunctionName:FunctionName,State:State,LastModified:LastModified}' --output table

# Clean up test files
rm -f s3-bucket-policy-fixed.json email-forwarding-rule-fixed.json s3-notification-config-fixed.json test-email-complete.eml test-response.json

echo ""
echo "🎉 Email Forwarding System Fix Complete!"
echo "========================================"
echo ""
echo "📧 How to Test:"
echo "1. Send an email to mail@raj.kr from any email client"
echo "2. Check your Gmail inbox for the forwarded message"
echo "3. The forwarded email should have:"
echo "   - From: mail@raj.kr"
echo "   - Reply-To: original sender's email"
echo "   - Subject: [FWD: Original Subject]"
echo ""
echo "🔍 Troubleshooting:"
echo "- Check CloudWatch logs for Lambda function"
echo "- Verify S3 bucket has the email files"
echo "- Ensure DNS MX records are properly configured"
