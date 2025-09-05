# Contact Form Lambda Deployment Script for Windows PowerShell
# This script builds and deploys the Lambda function to AWS on Windows

param(
    [string]$FunctionName = "contact-form-handler",
    [string]$AwsRegion = "us-east-1",
    [string]$RoleArn = "",
    [string]$FromEmail = "noreply@yourdomain.com",
    [string]$ToEmail = "your-email@yourdomain.com",
    [string]$ReplyToEmail = "your-email@yourdomain.com"
)

Write-Host "🚀 Starting Contact Form Lambda Deployment (Windows PowerShell)..." -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if AWS credentials are configured
try {
    $null = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "AWS credentials not configured"
    }
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Function Name: $FunctionName" -ForegroundColor White
Write-Host "  AWS Region: $AwsRegion" -ForegroundColor White
Write-Host "  Role ARN: $RoleArn" -ForegroundColor White

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the deployment package
Write-Host "🔨 Building deployment package for Windows..." -ForegroundColor Yellow

# Remove existing zip file if it exists
if (Test-Path "contact-form-lambda.zip") {
    Remove-Item "contact-form-lambda.zip" -Force
}

# Create zip file using PowerShell
try {
    Compress-Archive -Path "index.js", "node_modules" -DestinationPath "contact-form-lambda.zip" -Force
    Write-Host "✅ Zip file created successfully: contact-form-lambda.zip" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create zip file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if function exists
Write-Host "🔍 Checking if function exists..." -ForegroundColor Yellow
$functionExists = $false
try {
    $null = aws lambda get-function --function-name $FunctionName --region $AwsRegion 2>$null
    if ($LASTEXITCODE -eq 0) {
        $functionExists = $true
    }
} catch {
    # Function doesn't exist, which is fine
}

if ($functionExists) {
    Write-Host "📝 Function exists, updating code..." -ForegroundColor Yellow
    aws lambda update-function-code --function-name $FunctionName --zip-file fileb://contact-form-lambda.zip --region $AwsRegion
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to update function code" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Function code updated successfully!" -ForegroundColor Green
} else {
    Write-Host "🆕 Function doesn't exist, creating new function..." -ForegroundColor Yellow
    
    if ([string]::IsNullOrEmpty($RoleArn)) {
        Write-Host "❌ ROLE_ARN is required for creating a new function." -ForegroundColor Red
        Write-Host "Please set the ROLE_ARN parameter or create a Lambda execution role first." -ForegroundColor Red
        exit 1
    }
    
    aws lambda create-function --function-name $FunctionName --runtime nodejs18.x --role $RoleArn --handler index.handler --zip-file fileb://contact-form-lambda.zip --region $AwsRegion --description "Contact form handler for portfolio website" --timeout 30 --memory-size 128
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create function" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Function created successfully!" -ForegroundColor Green
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
$envVars = @{
    AWS_REGION = $AwsRegion
    FROM_EMAIL = $FromEmail
    TO_EMAIL = $ToEmail
    REPLY_TO_EMAIL = $ReplyToEmail
} | ConvertTo-Json -Compress

aws lambda update-function-configuration --function-name $FunctionName --environment Variables=$envVars --region $AwsRegion
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set environment variables" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Environment variables set!" -ForegroundColor Green

# Test the function
Write-Host "🧪 Testing the deployed function..." -ForegroundColor Yellow
node test.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Function test failed, but deployment was successful" -ForegroundColor Yellow
}

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up API Gateway to trigger this Lambda function" -ForegroundColor White
Write-Host "2. Configure SES to send emails" -ForegroundColor White
Write-Host "3. Update your frontend API configuration with the API Gateway URL" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "  View function: aws lambda get-function --function-name $FunctionName --region $AwsRegion" -ForegroundColor White
Write-Host "  View logs: aws logs tail /aws/lambda/$FunctionName --follow --region $AwsRegion" -ForegroundColor White
Write-Host "  Delete function: aws lambda delete-function --function-name $FunctionName --region $AwsRegion" -ForegroundColor White
