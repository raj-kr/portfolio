@echo off
REM Contact Form Lambda Deployment Script for Windows
REM This script builds and deploys the Lambda function to AWS on Windows

echo 🚀 Starting Contact Form Lambda Deployment (Windows)...

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ AWS credentials not configured. Please run 'aws configure' first.
    exit /b 1
)

REM Get configuration from environment variables
set FUNCTION_NAME=%FUNCTION_NAME%
if "%FUNCTION_NAME%"=="" set FUNCTION_NAME=contact-form-handler

set AWS_REGION=%AWS_REGION%
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

set ROLE_ARN=%ROLE_ARN%

echo 📋 Deployment Configuration:
echo   Function Name: %FUNCTION_NAME%
echo   AWS Region: %AWS_REGION%
echo   Role ARN: %ROLE_ARN%

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Build the deployment package (Windows compatible)
echo 🔨 Building deployment package for Windows...

REM Try PowerShell first (Windows 10+)
where powershell >nul 2>nul
if %errorlevel% equ 0 (
    echo Using PowerShell to create zip file...
    powershell -Command "Compress-Archive -Path 'index.js', 'node_modules' -DestinationPath 'contact-form-lambda.zip' -Force"
    if %errorlevel% equ 0 goto :zip_success
)

REM Try 7-Zip
where 7z >nul 2>nul
if %errorlevel% equ 0 (
    echo Using 7-Zip to create zip file...
    7z a -tzip contact-form-lambda.zip index.js node_modules/
    if %errorlevel% equ 0 goto :zip_success
)

REM Try tar (Git Bash)
where tar >nul 2>nul
if %errorlevel% equ 0 (
    echo Using tar to create zip file...
    tar -a -cf contact-form-lambda.zip index.js node_modules/
    if %errorlevel% equ 0 goto :zip_success
)

echo ❌ No zip utility found. Please install one of:
echo   - PowerShell (built-in on Windows 10+)
echo   - 7-Zip (https://www.7-zip.org/)
echo   - Git Bash (includes tar)
exit /b 1

:zip_success
REM Verify zip file was created
if not exist "contact-form-lambda.zip" (
    echo ❌ Failed to create zip file
    exit /b 1
)

echo ✅ Zip file created successfully: contact-form-lambda.zip

REM Check if function exists
aws lambda get-function --function-name "%FUNCTION_NAME%" --region "%AWS_REGION%" >nul 2>nul
if %errorlevel% equ 0 (
    echo 📝 Function exists, updating code...
    aws lambda update-function-code --function-name "%FUNCTION_NAME%" --zip-file fileb://contact-form-lambda.zip --region "%AWS_REGION%"
    if %errorlevel% neq 0 (
        echo ❌ Failed to update function code
        exit /b 1
    )
    echo ✅ Function code updated successfully!
) else (
    echo 🆕 Function doesn't exist, creating new function...
    
    if "%ROLE_ARN%"=="" (
        echo ❌ ROLE_ARN is required for creating a new function.
        echo Please set the ROLE_ARN environment variable or create a Lambda execution role first.
        exit /b 1
    )
    
    aws lambda create-function --function-name "%FUNCTION_NAME%" --runtime nodejs18.x --role "%ROLE_ARN%" --handler index.handler --zip-file fileb://contact-form-lambda.zip --region "%AWS_REGION%" --description "Contact form handler for portfolio website" --timeout 30 --memory-size 128
    if %errorlevel% neq 0 (
        echo ❌ Failed to create function
        exit /b 1
    )
    echo ✅ Function created successfully!
)

REM Set environment variables
echo 🔧 Setting environment variables...
aws lambda update-function-configuration --function-name "%FUNCTION_NAME%" --environment Variables="{AWS_REGION=%AWS_REGION%,FROM_EMAIL=%FROM_EMAIL%,TO_EMAIL=%TO_EMAIL%,REPLY_TO_EMAIL=%REPLY_TO_EMAIL%}" --region "%AWS_REGION%"
if %errorlevel% neq 0 (
    echo ❌ Failed to set environment variables
    exit /b 1
)
echo ✅ Environment variables set!

REM Test the function
echo 🧪 Testing the deployed function...
call node test.js
if %errorlevel% neq 0 (
    echo ⚠️ Function test failed, but deployment was successful
)

echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Set up API Gateway to trigger this Lambda function
echo 2. Configure SES to send emails
echo 3. Update your frontend API configuration with the API Gateway URL
echo.
echo 🔗 Useful Commands:
echo   View function: aws lambda get-function --function-name %FUNCTION_NAME% --region %AWS_REGION%
echo   View logs: aws logs tail /aws/lambda/%FUNCTION_NAME% --follow --region %AWS_REGION%
echo   Delete function: aws lambda delete-function --function-name %FUNCTION_NAME% --region %AWS_REGION%
