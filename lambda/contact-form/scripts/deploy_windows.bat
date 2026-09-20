@echo off
cd /d "%~dp0.."
REM Contact Form Lambda Deployment Script for Windows
REM This script builds and deploys the Lambda function to AWS on Windows

echo  Starting Contact Form Lambda Deployment (Windows)...

REM Check if AWS CLI is installed
where aws >nul 2>nul
if errorlevel 1 (
    echo  AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>nul
if errorlevel 1 (
    echo  AWS credentials not configured. Please run 'aws configure' first.
    exit /b 1
)

REM Get configuration from environment variables
set FUNCTION_NAME=%FUNCTION_NAME%
if "%FUNCTION_NAME%"=="" set FUNCTION_NAME=contact-form-handler

set AWS_REGION=%AWS_REGION%
if "%AWS_REGION%"=="" set AWS_REGION=ap-south-1

set ROLE_ARN=%ROLE_ARN%

REM Replace the old personal Gmail recipient unless explicitly overridden.
if "%TO_EMAIL%"=="" set "TO_EMAIL=mail@raj.kr"

echo  Deployment Configuration:
echo   Function Name: %FUNCTION_NAME%
echo   AWS Region: %AWS_REGION%
echo   Role ARN: %ROLE_ARN%

REM Install dependencies
echo  Installing dependencies...
call npm ci
if errorlevel 1 (
    echo  Failed to install dependencies
    exit /b 1
)

call npm test
if errorlevel 1 exit /b 1

call npm run build
if errorlevel 1 exit /b 1

REM Check if function exists
aws lambda get-function --function-name "%FUNCTION_NAME%" --region "%AWS_REGION%" >nul 2>nul
if not errorlevel 1 (
    echo  Function exists, updating code...
    aws lambda update-function-code --function-name "%FUNCTION_NAME%" --zip-file fileb://contact-form-lambda.zip --region "%AWS_REGION%"
    if errorlevel 1 (
        echo  Failed to update function code
        exit /b 1
    )
    echo  Function code updated successfully!
) else (
    echo  Function doesn't exist, creating new function...
    
    if "%ROLE_ARN%"=="" (
        echo  ROLE_ARN is required for creating a new function.
        echo Please set the ROLE_ARN environment variable or create a Lambda execution role first.
        exit /b 1
    )
    
    aws lambda create-function --function-name "%FUNCTION_NAME%" --runtime nodejs22.x --role "%ROLE_ARN%" --handler index.handler --zip-file fileb://contact-form-lambda.zip --region "%AWS_REGION%" --description "Contact form handler for portfolio website" --timeout 30 --memory-size 128
    if errorlevel 1 (
        echo  Failed to create function
        exit /b 1
    )
    echo  Function created successfully!
)

REM Set environment variables
echo  Setting environment variables...
node ../configure-function.mjs "%FUNCTION_NAME%" "%AWS_REGION%" "--from=%FROM_EMAIL%" "--to=%TO_EMAIL%"
if errorlevel 1 (
    echo  Failed to set environment variables
    exit /b 1
)
echo  Environment variables set!

echo  Deployment completed successfully!
echo.
echo  Next Steps:
echo 1. Set up API Gateway to trigger this Lambda function
echo 2. Configure SES to send emails
echo 3. Update your frontend API configuration with the API Gateway URL
echo.
echo  Useful Commands:
echo   View function: aws lambda get-function --function-name %FUNCTION_NAME% --region %AWS_REGION%
echo   View logs: aws logs tail /aws/lambda/%FUNCTION_NAME% --follow --region %AWS_REGION%
echo   Delete function: aws lambda delete-function --function-name %FUNCTION_NAME% --region %AWS_REGION%
