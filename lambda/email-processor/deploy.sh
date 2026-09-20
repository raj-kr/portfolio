#!/bin/bash

# Email Processor Lambda Deployment Script
# This script builds and deploys the email processor Lambda function

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚀 Starting Email Processor Lambda Deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Get configuration from environment variables
FUNCTION_NAME=${FUNCTION_NAME:-"email-processor"}
AWS_REGION=${AWS_REGION:-"ap-south-1"}
ROLE_ARN=${ROLE_ARN:-"arn:aws:iam::016116087217:role/raj.kr-LambdaRole"}

echo "📋 Deployment Configuration:"
echo "  Function Name: $FUNCTION_NAME"
echo "  AWS Region: $AWS_REGION"
echo "  Role ARN: $ROLE_ARN"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
npm test

# Build a fresh ZIP on Windows or Linux.
npm run build

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "📝 Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://email-processor.zip \
        --region "$AWS_REGION"
    
    echo "✅ Function code updated successfully!"
else
    echo "🆕 Function doesn't exist, creating new function..."
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs22.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://email-processor.zip \
        --region "$AWS_REGION" \
        --description "Email processor for forwarding emails from S3 to Gmail" \
        --timeout 60 \
        --memory-size 256
    
    echo "✅ Function created successfully!"
fi

# Preserve existing settings, remove reserved variables, and wait for updates.
node ../configure-function.mjs "$FUNCTION_NAME" "$AWS_REGION" "--from=${FROM_EMAIL:-}" "--to=${TO_EMAIL:-}"

# Add S3 trigger permissions
echo "🔐 Setting up S3 trigger permissions..."
aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --principal s3.amazonaws.com \
    --action lambda:InvokeFunction \
    --source-arn "arn:aws:s3:::myemail-log" \
    --statement-id "s3-trigger-permission" \
    --region "$AWS_REGION" 2>/dev/null || echo "Permission already exists"

echo "✅ S3 trigger permissions set!"

echo "🎉 Email Processor deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up S3 bucket notification to trigger this Lambda"
echo "2. Update SES receipt rules to store emails in S3"
echo "3. Test the email forwarding system"
echo ""
echo "🔗 Useful Commands:"
echo "  View function: aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION"
echo "  View logs: aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $AWS_REGION"
echo "  Test function: aws lambda invoke --function-name $FUNCTION_NAME --region $AWS_REGION response.json"
