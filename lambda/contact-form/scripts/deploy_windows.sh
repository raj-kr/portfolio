#!/bin/bash

# Contact Form Lambda Deployment Script for Windows
# This script builds and deploys the Lambda function to AWS on Windows

set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "🚀 Starting Contact Form Lambda Deployment (Windows)..."

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

# Get configuration from environment variables or prompt user
FUNCTION_NAME=${FUNCTION_NAME:-"contact-form-handler"}
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
        --zip-file fileb://contact-form-lambda.zip \
        --region "$AWS_REGION"
    
    echo "✅ Function code updated successfully!"
else
    echo "🆕 Function doesn't exist, creating new function..."
    
    if [ -z "$ROLE_ARN" ]; then
        echo "❌ ROLE_ARN is required for creating a new function."
        echo "Please set the ROLE_ARN environment variable or create a Lambda execution role first."
        exit 1
    fi
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs22.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://contact-form-lambda.zip \
        --region "$AWS_REGION" \
        --description "Contact form handler for portfolio website" \
        --timeout 30 \
        --memory-size 128
    
    echo "✅ Function created successfully!"
fi

# Preserve existing settings, remove reserved variables, and wait for updates.
node ../configure-function.mjs "$FUNCTION_NAME" "$AWS_REGION" "--from=${FROM_EMAIL:-}" "--to=${TO_EMAIL:-}"


echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up API Gateway to trigger this Lambda function"
echo "2. Configure SES to send emails"
echo "3. Update your frontend API configuration with the API Gateway URL"
echo ""
echo "🔗 Useful Commands:"
echo "  View function: aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION"
echo "  View logs: aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $AWS_REGION"
echo "  Delete function: aws lambda delete-function --function-name $FUNCTION_NAME --region $AWS_REGION"
