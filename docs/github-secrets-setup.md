# GitHub Secrets Setup for Analytics

This guide shows how to set up the required GitHub secrets for the analytics-enabled deployment workflow.

## Required Secrets

### AWS Secrets (Required)
1. **AWS_ACCESS_KEY_ID**
   - Your AWS access key ID
   - Used for S3 deployment and CloudFront invalidation

2. **AWS_SECRET_ACCESS_KEY**
   - Your AWS secret access key
   - Used for S3 deployment and CloudFront invalidation

3. **AWS_REGION**
   - AWS region (e.g., `us-east-1`, `eu-west-1`)
   - Used for AWS CLI configuration

4. **S3_BUCKET**
   - Your S3 bucket name for deployment
   - The bucket where your built site will be uploaded

5. **DISTRIBUTION_ID**
   - Your CloudFront distribution ID
   - Used for cache invalidation after deployment

### Analytics Secret (Optional)
6. **NEXT_PUBLIC_GA_ID**
   - Your Google Analytics Measurement ID
   - Format: `G-XXXXXXXXXX` (where X are alphanumeric characters)
   - If not set, analytics will be disabled

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Example Setup

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET=my-website-bucket
DISTRIBUTION_ID=E1234567890ABCD

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Testing the Setup

1. Push to your main branch to trigger the workflow
2. Check the **Actions** tab in your GitHub repository
3. Look for the "Validate Analytics Configuration" step
4. Verify that the deployment completes successfully

## Troubleshooting

### Analytics Not Working
- Check that `NEXT_PUBLIC_GA_ID` is set correctly
- Verify the GA ID format (G-XXXXXXXXXX)
- Ensure the secret is named exactly `NEXT_PUBLIC_GA_ID`

### Build Fails
- Check that all required AWS secrets are set
- Verify AWS credentials have proper permissions
- Ensure S3 bucket exists and is accessible

### Deployment Fails
- Check CloudFront distribution ID is correct
- Verify S3 bucket name is correct
- Ensure AWS region matches your resources

## Security Notes

- Never commit secrets to your repository
- Use different GA IDs for different environments
- Rotate AWS credentials periodically
- Monitor GitHub Actions logs for any exposed secrets
