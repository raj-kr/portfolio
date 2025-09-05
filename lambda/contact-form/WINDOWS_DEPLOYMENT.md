# Windows Deployment Guide

This guide provides Windows-specific instructions for deploying the contact form Lambda function.

## 🪟 Windows Deployment Options

### Option 1: Git Bash (Recommended)

```bash
cd lambda/contact-form
npm install
./deploy_windows.sh
```

### Option 2: Command Prompt

```cmd
cd lambda\contact-form
npm install
deploy_windows.bat
```

### Option 3: PowerShell

```powershell
cd lambda\contact-form
npm install
.\deploy_windows.ps1
```

### Option 4: PowerShell with Parameters

```powershell
.\deploy_windows.ps1 -FunctionName "contact-form-handler" -AwsRegion "ap-south-1" -RoleArn "arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
```

## 📋 Prerequisites

### Required Software

- **Node.js** (18+): [Download](https://nodejs.org/)
- **AWS CLI**: [Download](https://aws.amazon.com/cli/)
- **Git for Windows** (for Git Bash): [Download](https://git-scm.com/download/win)

### Optional Software

- **7-Zip** (alternative zip utility): [Download](https://www.7-zip.org/)
- **PowerShell** (usually pre-installed on Windows 10+)

## 🔧 Environment Setup

### 1. Configure AWS CLI

```cmd
aws configure
```

Enter your:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `ap-south-1`)
- Default output format (e.g., `json`)

### 2. Set Environment Variables

**Command Prompt:**

```cmd
set FUNCTION_NAME=contact-form-handler
set AWS_REGION=ap-south-1
set ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role
set FROM_EMAIL=noreply@yourdomain.com
set TO_EMAIL=your-email@yourdomain.com
set REPLY_TO_EMAIL=your-email@yourdomain.com
```

**PowerShell:**

```powershell
$env:FUNCTION_NAME="contact-form-handler"
$env:AWS_REGION="ap-south-1"
$env:ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
$env:FROM_EMAIL="noreply@yourdomain.com"
$env:TO_EMAIL="your-email@yourdomain.com"
$env:REPLY_TO_EMAIL="your-email@yourdomain.com"
```

## 🚀 Deployment Steps

### Step 1: Navigate to Lambda Directory

```cmd
cd lambda\contact-form
```

### Step 2: Install Dependencies

```cmd
npm install
```

### Step 3: Deploy (Choose one method)

#### Method A: Git Bash

```bash
./deploy_windows.sh
```

#### Method B: Command Prompt

```cmd
deploy_windows.bat
```

#### Method C: PowerShell

```powershell
.\deploy_windows.ps1
```

#### Method D: Using npm scripts

```cmd
# Build and deploy in one command
npm run build:windows && npm run deploy:windows:bat
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "zip command not found"

**Solution**: Use the Windows-specific scripts that use PowerShell's `Compress-Archive` cmdlet.

#### 2. "PowerShell execution policy"

**Solution**: Run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. "AWS credentials not configured"

**Solution**: Run `aws configure` and enter your credentials.

#### 4. "Permission denied" errors

**Solution**:

- Run Command Prompt/PowerShell as Administrator
- Or use Git Bash which handles permissions better

#### 5. "Function already exists" error

**Solution**: The script will automatically update the existing function. This is normal behavior.

### Debug Commands

```cmd
# Check AWS CLI version
aws --version

# Check AWS credentials
aws sts get-caller-identity

# List existing Lambda functions
aws lambda list-functions --region ap-south-1

# Check function details
aws lambda get-function --function-name contact-form-handler --region ap-south-1
```

## 📊 Script Comparison

| Script               | Shell      | Zip Method | Pros                   | Cons                   |
| -------------------- | ---------- | ---------- | ---------------------- | ---------------------- |
| `deploy_windows.sh`  | Git Bash   | PowerShell | Cross-platform, robust | Requires Git Bash      |
| `deploy_windows.bat` | CMD        | PowerShell | Native Windows         | Limited error handling |
| `deploy_windows.ps1` | PowerShell | PowerShell | Native, parameterized  | Requires PowerShell    |

## 🎯 Recommended Workflow

1. **Use Git Bash** for the best experience
2. **Set environment variables** before deployment
3. **Test locally** with `npm test` before deploying
4. **Check AWS Console** to verify deployment

## 📚 Additional Resources

- [AWS CLI Windows Installation](https://docs.aws.amazon.com/cli/latest/userguide/install-windows.html)
- [PowerShell Execution Policies](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
- [Git for Windows](https://git-scm.com/download/win)

## ✅ Success Indicators

After successful deployment, you should see:

- ✅ Function code updated successfully!
- ✅ Environment variables set!
- ✅ Deployment completed successfully!

Check the AWS Lambda console to verify your function is deployed and configured correctly.
