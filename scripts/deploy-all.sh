#!/bin/bash

# Complete Deployment Script for Portfolio Website
# This script deploys both the frontend and Lambda function

set -e  # Exit on any error

echo "🚀 Starting Complete Portfolio Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
DEPLOY_LAMBDA=true
DEPLOY_FRONTEND=true
LAMBDA_ONLY=false
FRONTEND_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --lambda-only)
            LAMBDA_ONLY=true
            DEPLOY_FRONTEND=false
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            DEPLOY_LAMBDA=false
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --lambda-only    Deploy only the Lambda function"
            echo "  --frontend-only  Deploy only the frontend"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Deploy Lambda function
if [ "$DEPLOY_LAMBDA" = true ]; then
    print_status "Deploying Lambda function..."
    
    if [ ! -d "lambda/contact-form" ]; then
        print_error "Lambda directory not found. Please ensure lambda/contact-form exists."
        exit 1
    fi
    
    cd lambda/contact-form
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Deploy Lambda
    if [ -f "deploy.sh" ]; then
        ./deploy.sh
        print_success "Lambda function deployed successfully!"
    else
        print_error "deploy.sh not found in lambda/contact-form directory"
        exit 1
    fi
    
    cd ../..
fi

# Deploy frontend
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_status "Deploying frontend..."
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    # Check if GitHub Actions is configured
    if [ -d ".github/workflows" ]; then
        print_status "GitHub Actions workflow detected."
        print_warning "Frontend will be deployed automatically via GitHub Actions when you push to the main branch."
        print_status "To deploy manually, you can:"
        echo "  1. Push your changes to GitHub"
        echo "  2. Or manually upload the 'dist' folder to your hosting service"
    else
        print_warning "No GitHub Actions workflow found."
        print_status "Frontend build completed. Upload the 'dist' folder to your hosting service."
    fi
    
    print_success "Frontend build completed successfully!"
fi

# Summary
echo ""
print_success "Deployment completed!"
echo ""

if [ "$DEPLOY_LAMBDA" = true ]; then
    echo "📧 Lambda Function:"
    echo "  - Function deployed to AWS Lambda"
    echo "  - Configure API Gateway to trigger this function"
    echo "  - Set up SES for email delivery"
    echo ""
fi

if [ "$DEPLOY_FRONTEND" = true ]; then
    echo "🌐 Frontend:"
    echo "  - Build completed in 'dist' folder"
    echo "  - Deploy 'dist' folder to your hosting service"
    echo "  - Or push to GitHub for automatic deployment"
    echo ""
fi

echo "📋 Next Steps:"
echo "1. Set up API Gateway to connect frontend to Lambda"
echo "2. Configure SES for email delivery"
echo "3. Update frontend API configuration with API Gateway URL"
echo "4. Test the contact form end-to-end"
echo ""
echo "📚 Documentation:"
echo "  - Lambda setup: lambda/contact-form/README.md"
echo "  - API setup: docs/api-setup-guide.md"
echo "  - Contact modal: docs/contact-modal-implementation.md"
