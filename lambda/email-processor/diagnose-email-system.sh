#!/bin/bash

# Comprehensive Email System Diagnosis
echo "🔍 Diagnosing Email Forwarding System"
echo "====================================="

AWS_REGION="ap-south-1"
BUCKET_NAME="myemail-log"
FUNCTION_NAME="email-processor"
DOMAIN="raj.kr"

echo "📋 System Configuration:"
echo "  Domain: $DOMAIN"
echo "  AWS Region: $AWS_REGION"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Lambda Function: $FUNCTION_NAME"
echo ""

# 1. Check SES Domain Verification
echo "1️⃣ Checking SES Domain Verification..."
echo "======================================"
aws ses get-identity-verification-attributes --identities "$DOMAIN" --region "$AWS_REGION" --query "VerificationAttributes.$DOMAIN.VerificationStatus" --output text

# 2. Check MX Records (DNS)
echo ""
echo "2️⃣ Checking MX Records..."
echo "========================"
echo "Please check your DNS settings for these MX records:"
echo "  Priority 10: inbound-smtp.$AWS_REGION.amazonaws.com"
echo ""
echo "Current MX records for $DOMAIN:"
nslookup -type=MX "$DOMAIN" 2>/dev/null || echo "nslookup not available - check DNS manually"

# 3. Check SES Receipt Rule Set
echo ""
echo "3️⃣ Checking SES Receipt Rule Set..."
echo "=================================="
echo "Active Rule Set:"
aws ses describe-active-receipt-rule-set --region "$AWS_REGION" --query 'RuleSet.Name' --output text 2>/dev/null || echo "None"

echo ""
echo "Rule Set Details:"
aws ses describe-receipt-rule-set --rule-set-name "email-forwarding-ruleset" --region "$AWS_REGION" --query 'RuleSet.Rules[0]' 2>/dev/null || echo "Rule set not found"

# 4. Check S3 Bucket and Permissions
echo ""
echo "4️⃣ Checking S3 Bucket..."
echo "========================"
echo "Bucket exists:"
aws s3 ls "s3://$BUCKET_NAME" --region "$AWS_REGION" &> /dev/null && echo "✅ Yes" || echo "❌ No"

echo ""
echo "Recent email files:"
aws s3 ls "s3://$BUCKET_NAME/emails/" --region "$AWS_REGION" | tail -5

# 5. Check Lambda Function
echo ""
echo "5️⃣ Checking Lambda Function..."
echo "=============================="
echo "Function exists:"
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null && echo "✅ Yes" || echo "❌ No"

echo ""
echo "Function configuration:"
aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --region "$AWS_REGION" --query '{FunctionName:FunctionName,State:State,LastModified:LastModified}' --output table

# 6. Check S3 Notifications
echo ""
echo "6️⃣ Checking S3 Notifications..."
echo "==============================="
aws s3api get-bucket-notification-configuration --bucket "$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null || echo "No notification configuration found"

# 7. Test Email Processing
echo ""
echo "7️⃣ Testing Email Processing..."
echo "=============================="
echo "Creating test email..."
cat > test-diagnostic.eml << EOF
From: diagnostic@example.com
To: mail@raj.kr
Subject: Diagnostic Test Email
Date: $(date -R)
Content-Type: text/plain; charset=UTF-8

This is a diagnostic test email to verify the system is working.

System should:
1. Receive via SES
2. Store in S3
3. Trigger Lambda
4. Forward to Gmail

Test completed at: $(date)
EOF

echo "Uploading test email to S3..."
aws s3 cp test-diagnostic.eml "s3://$BUCKET_NAME/emails/diagnostic-$(date +%s).eml" --region "$AWS_REGION"

echo "✅ Test email uploaded"

# 8. Check Recent Lambda Logs
echo ""
echo "8️⃣ Checking Recent Lambda Logs..."
echo "================================="
LOG_GROUP="/aws/lambda/$FUNCTION_NAME"
echo "Log group: $LOG_GROUP"

# Get recent log streams
LOG_STREAMS=$(aws logs describe-log-streams --log-group-name "$LOG_GROUP" --region "$AWS_REGION" --order-by LastEventTime --descending --max-items 3 --query 'logStreams[].logStreamName' --output text 2>/dev/null)

if [ -n "$LOG_STREAMS" ]; then
    echo "Recent log streams found"
    for stream in $LOG_STREAMS; do
        echo "Stream: $stream"
        aws logs get-log-events --log-group-name "$LOG_GROUP" --log-stream-name "$stream" --region "$AWS_REGION" --start-time $(date -d '1 hour ago' +%s)000 --query 'events[].message' --output text 2>/dev/null | tail -3
        echo ""
    done
else
    echo "No recent log streams found"
fi

# Clean up
rm -f test-diagnostic.eml

echo ""
echo "🎯 Diagnosis Complete!"
echo "====================="
echo ""
echo "📋 Next Steps:"
echo "1. Verify DNS MX records are set to: inbound-smtp.$AWS_REGION.amazonaws.com"
echo "2. Ensure domain is verified in SES"
echo "3. Check Gmail inbox for forwarded emails"
echo "4. Monitor CloudWatch logs for Lambda function"
echo ""
echo "🔧 If emails are not being received:"
echo "- Check DNS propagation (can take up to 48 hours)"
echo "- Verify domain verification status in SES"
echo "- Test with a simple email client (not Gmail to Gmail)"
