# Contact Form Lambda Deployment Script for Windows PowerShell
# This script builds and deploys the Lambda function to AWS on Windows

param(
    [string]$FunctionName = "contact-form-handler",
    [string]$AwsRegion = "ap-south-1",
    [string]$RoleArn = "",
    [string]$FromEmail = "",
    [string]$ToEmail = "mail@raj.kr"
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Join-Path $PSScriptRoot "..")

Write-Host " Starting Contact Form Lambda Deployment (Windows PowerShell)..." -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
} catch {
    Write-Host " AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if AWS credentials are configured
try {
    $null = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "AWS credentials not configured"
    }
} catch {
    Write-Host " AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host " Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Function Name: $FunctionName" -ForegroundColor White
Write-Host "  AWS Region: $AwsRegion" -ForegroundColor White
Write-Host "  Role ARN: $RoleArn" -ForegroundColor White

# Install dependencies
Write-Host " Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host " Failed to install dependencies" -ForegroundColor Red
    exit 1
}

npm test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Check if function exists
Write-Host " Checking if function exists..." -ForegroundColor Yellow
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
    Write-Host " Function exists, updating code..." -ForegroundColor Yellow
    aws lambda update-function-code --function-name $FunctionName --zip-file fileb://contact-form-lambda.zip --region $AwsRegion
    if ($LASTEXITCODE -ne 0) {
        Write-Host " Failed to update function code" -ForegroundColor Red
        exit 1
    }
    Write-Host " Function code updated successfully!" -ForegroundColor Green
} else {
    Write-Host " Function doesn't exist, creating new function..." -ForegroundColor Yellow
    
    if ([string]::IsNullOrEmpty($RoleArn)) {
        Write-Host " ROLE_ARN is required for creating a new function." -ForegroundColor Red
        Write-Host "Please set the ROLE_ARN parameter or create a Lambda execution role first." -ForegroundColor Red
        exit 1
    }
    
    aws lambda create-function --function-name $FunctionName --runtime nodejs22.x --role $RoleArn --handler index.handler --zip-file fileb://contact-form-lambda.zip --region $AwsRegion --description "Contact form handler for portfolio website" --timeout 30 --memory-size 128
    if ($LASTEXITCODE -ne 0) {
        Write-Host " Failed to create function" -ForegroundColor Red
        exit 1
    }
    Write-Host " Function created successfully!" -ForegroundColor Green
}

# Migrate the recipient to Workspace while preserving unrelated settings.
if ([string]::IsNullOrWhiteSpace($ToEmail)) { $ToEmail = "mail@raj.kr" }
node ../configure-function.mjs $FunctionName $AwsRegion "--from=$FromEmail" "--to=$ToEmail"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host " Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host " Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up API Gateway to trigger this Lambda function" -ForegroundColor White
Write-Host "2. Configure SES to send emails" -ForegroundColor White
Write-Host "3. Update your frontend API configuration with the API Gateway URL" -ForegroundColor White
Write-Host ""
Write-Host " Useful Commands:" -ForegroundColor Cyan
Write-Host "  View function: aws lambda get-function --function-name $FunctionName --region $AwsRegion" -ForegroundColor White
Write-Host "  View logs: aws logs tail /aws/lambda/$FunctionName --follow --region $AwsRegion" -ForegroundColor White
Write-Host "  Delete function: aws lambda delete-function --function-name $FunctionName --region $AwsRegion" -ForegroundColor White
