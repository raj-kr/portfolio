# CI/CD Analytics Setup

This document covers how to configure Google Analytics in different CI/CD environments.

## General Principles

- Set `NEXT_PUBLIC_GA_ID` as an environment variable in your CI/CD platform
- The analytics will only load when the environment variable is properly set
- No code changes needed - just environment configuration

## Platform-Specific Setup

### 1. Vercel

#### Environment Variables Setup
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX` (your actual GA ID)
   - **Environment**: Production, Preview, Development (select all)

#### Vercel Configuration File
Create `vercel.json` in your project root:

```json
{
  "env": {
    "NEXT_PUBLIC_GA_ID": "@ga-id"
  }
}
```

### 2. Netlify

#### Environment Variables Setup
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`

#### Netlify Configuration File
Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_GA_ID = "G-XXXXXXXXXX"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Actions

#### Workflow Configuration
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
    
    - name: Deploy to platform
      run: |
        # Your deployment commands here
        # The environment variable will be available
```

#### GitHub Secrets Setup
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add a new repository secret:
   - **Name**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`

### 4. GitLab CI/CD

#### GitLab CI Configuration
Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  variables:
    NEXT_PUBLIC_GA_ID: $NEXT_PUBLIC_GA_ID
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - echo "Deploy to your platform"
  only:
    - main
```

#### GitLab Variables Setup
1. Go to your GitLab project
2. Navigate to **Settings** → **CI/CD** → **Variables**
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`
   - **Type**: Variable
   - **Environment scope**: All (default)

### 5. AWS Amplify

#### Amplify Configuration
Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Environment Variables Setup
1. Go to your Amplify app console
2. Navigate to **App settings** → **Environment variables**
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`

### 6. Docker/Kubernetes

#### Dockerfile Example
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose Example
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_GA_ID: ${NEXT_PUBLIC_GA_ID}
    environment:
      - NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
    ports:
      - "3000:3000"
```

## Environment-Specific Configuration

### Development Environment
```bash
# .env.development
NEXT_PUBLIC_GA_ID=G-DEV-XXXXXXXXXX
```

### Staging Environment
```bash
# .env.staging
NEXT_PUBLIC_GA_ID=G-STAGING-XXXXXXXXXX
```

### Production Environment
```bash
# .env.production
NEXT_PUBLIC_GA_ID=G-PROD-XXXXXXXXXX
```

## Testing in CI/CD

### Pre-deployment Testing
Add this to your CI/CD pipeline to verify analytics setup:

```bash
# Test that environment variable is set
if [ -z "$NEXT_PUBLIC_GA_ID" ]; then
  echo "Warning: NEXT_PUBLIC_GA_ID is not set"
  exit 0  # Don't fail the build, just warn
fi

# Test that GA ID format is correct
if [[ ! $NEXT_PUBLIC_GA_ID =~ ^G-[A-Z0-9]{10}$ ]]; then
  echo "Error: NEXT_PUBLIC_GA_ID format is invalid"
  exit 1
fi

echo "Google Analytics ID is properly configured: $NEXT_PUBLIC_GA_ID"
```

### Build Verification
```bash
# Check if analytics files are included in build
if grep -q "google-analytics" .next/static/chunks/*.js; then
  echo "✅ Google Analytics is included in build"
else
  echo "⚠️  Google Analytics not found in build (this is normal if GA_ID is not set)"
fi
```

## Security Best Practices

1. **Never commit GA IDs to version control**
2. **Use different GA IDs for different environments**
3. **Rotate GA IDs periodically**
4. **Monitor analytics data for anomalies**

## Troubleshooting

### Common Issues

1. **Analytics not loading in production**
   - Check if environment variable is set correctly
   - Verify the variable name is exactly `NEXT_PUBLIC_GA_ID`
   - Ensure the GA ID format is correct (G-XXXXXXXXXX)

2. **Build fails with analytics error**
   - Analytics setup is designed to fail gracefully
   - Check if there are any syntax errors in analytics files
   - Verify all imports are correct

3. **Different analytics data between environments**
   - Ensure you're using different GA IDs for different environments
   - Check that environment variables are set correctly for each environment

### Debug Commands

```bash
# Check if environment variable is set
echo $NEXT_PUBLIC_GA_ID

# Verify GA ID format
if [[ $NEXT_PUBLIC_GA_ID =~ ^G-[A-Z0-9]{10}$ ]]; then
  echo "Valid GA ID format"
else
  echo "Invalid GA ID format"
fi

# Check build output for analytics
grep -r "google-analytics" .next/ || echo "No analytics found in build"
```
