#!/bin/bash

# Contact Form Lambda Deployment Script for Windows
# This script builds and deploys the Lambda function to AWS on Windows

set -e  # Exit on any error

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
npm install

# Build the deployment package (Windows compatible)
echo "🔨 Building deployment package for Windows..."

# Change to parent directory to access files
cd ..

# Check if PowerShell is available
if command -v powershell &> /dev/null; then
    echo "Using PowerShell to create zip file..."
    powershell -Command "Compress-Archive -Path 'index.js', 'node_modules' -DestinationPath 'contact-form-lambda.zip' -Force"
elif command -v 7z &> /dev/null; then
    echo "Using 7-Zip to create zip file..."
    7z a -tzip contact-form-lambda.zip index.js node_modules/
elif command -v tar &> /dev/null; then
    echo "Using tar to create zip file..."
    tar -a -cf contact-form-lambda.zip index.js node_modules/
else
    echo "❌ No zip utility found. Please install one of:"
    echo "  - PowerShell (built-in on Windows 10+)"
    echo "  - 7-Zip (https://www.7-zip.org/)"
    echo "  - Git Bash (includes tar)"
    exit 1
fi

# Verify zip file was created
if [ ! -f "contact-form-lambda.zip" ]; then
    echo "❌ Failed to create zip file"
    exit 1
fi

echo "✅ Zip file created successfully: contact-form-lambda.zip"

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
        --runtime nodejs18.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://contact-form-lambda.zip \
        --region "$AWS_REGION" \
        --description "Contact form handler for portfolio website" \
        --timeout 30 \
        --memory-size 128
    
    echo "✅ Function created successfully!"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment Variables="{
        AWS_REGION=$AWS_REGION,
        FROM_EMAIL=${FROM_EMAIL:-mail@raj.kr},
        TO_EMAIL=${TO_EMAIL:-rkgt76@gmail.com},
        REPLY_TO_EMAIL=${REPLY_TO_EMAIL:-mail@raj.kr}
    }" \
    --region "$AWS_REGION"

echo "✅ Environment variables set!"

# Test the function
echo "🧪 Testing the deployed function..."
node test.js

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
