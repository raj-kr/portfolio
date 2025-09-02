# Local Testing Guide for Google Analytics

This guide shows how to test Google Analytics locally during development.

## 🚀 Quick Setup

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# For testing with a real GA ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# For testing without analytics (optional)
# NEXT_PUBLIC_GA_ID=
```

### 2. Get Your Google Analytics ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Get your Measurement ID (starts with "G-")
4. Replace `G-XXXXXXXXXX` in `.env.local` with your actual ID

## 🧪 Testing Methods

### Method 1: Validation Script

Test if your analytics configuration is correct:

```bash
npm run validate:analytics
```

**Expected Output:**
```
🔍 Google Analytics Validation
==============================
✅ GA ID format is valid: G-XXXXXXXXXX
📁 Found environment files: .env.local
✅ Build directory exists

📊 Validation Summary:
✅ Google Analytics is properly configured for CI/CD
```

### Method 2: Test HTML Page

Generate a test HTML page to verify analytics in browser:

```bash
npm run test:analytics
```

This creates `analytics-test.html` that you can open in your browser.

### Method 3: Development Server

Start the development server and test analytics:

```bash
npm run dev
```

Then visit `http://localhost:3000` (or the port shown in terminal) and check:

1. **Browser Console**: Look for analytics-related messages
2. **Network Tab**: Check for requests to `google-analytics.com`
3. **Google Analytics Dashboard**: Verify real-time data

## 🔍 Verification Steps

### Browser Developer Tools

1. **Open Developer Tools** (F12)
2. **Go to Console Tab**: Look for analytics messages
3. **Go to Network Tab**: Filter by "google-analytics" or "gtag"
4. **Reload Page**: Check for analytics requests

### Expected Network Requests

You should see requests to:
- `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
- `https://www.google-analytics.com/g/collect`

### Console Messages

Look for messages like:
- `✅ Analytics test event sent successfully`
- `gtag` function availability

## 🛠️ Troubleshooting

### Analytics Not Loading

**Check:**
1. Is `NEXT_PUBLIC_GA_ID` set correctly in `.env.local`?
2. Is the GA ID format correct (G-XXXXXXXXXX)?
3. Are there any console errors?
4. Is the development server running?

**Solutions:**
```bash
# Verify environment variable
echo $NEXT_PUBLIC_GA_ID

# Check .env.local file
cat .env.local

# Restart development server
npm run dev
```

### No Network Requests

**Possible Causes:**
1. GA ID not set or incorrect
2. Ad blockers blocking analytics
3. Browser privacy settings
4. Network issues

**Solutions:**
1. Disable ad blockers for localhost
2. Check browser privacy settings
3. Try incognito/private mode
4. Verify GA ID in Google Analytics dashboard

### Build Errors

**Common Issues:**
1. TypeScript errors in analytics files
2. Missing environment variables
3. Import/export issues

**Solutions:**
```bash
# Check for TypeScript errors
npm run build

# Validate analytics configuration
npm run validate:analytics

# Check linting
npm run lint
```

## 📊 Testing Different Scenarios

### Test 1: With Analytics Enabled

```bash
# Set real GA ID
echo "NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX" > .env.local
npm run dev
```

### Test 2: Without Analytics

```bash
# Remove or comment out GA ID
echo "# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX" > .env.local
npm run dev
```

### Test 3: Invalid GA ID

```bash
# Set invalid GA ID
echo "NEXT_PUBLIC_GA_ID=INVALID-ID" > .env.local
npm run validate:analytics
```

## 🎯 Custom Event Testing

Test custom analytics events in your components:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackButtonClick } = useAnalytics();
  
  const handleClick = () => {
    trackButtonClick('Test Button', 'homepage');
    console.log('Button clicked - analytics event sent');
  };
  
  return <button onClick={handleClick}>Test Analytics</button>;
}
```

## 🔒 Security Notes

### Local Development

- ✅ Safe to use real GA ID for local testing
- ✅ `.env.local` is ignored by git (won't be committed)
- ✅ Analytics data will appear in your GA dashboard

### Production Deployment

- ❌ Never commit real GA IDs to version control
- ✅ Use CI/CD environment variables for production
- ✅ Use different GA IDs for different environments

## 📋 Checklist

Before deploying to production:

- [ ] Analytics works locally with real GA ID
- [ ] No console errors in browser
- [ ] Network requests to Google Analytics visible
- [ ] Custom events working correctly
- [ ] GA ID not committed to version control
- [ ] CI/CD environment variables set up
- [ ] Production GA ID different from development

## 🆘 Getting Help

If you encounter issues:

1. **Check the validation script output**
2. **Verify browser console for errors**
3. **Test with the generated HTML file**
4. **Check Google Analytics dashboard for data**
5. **Review the CI/CD setup documentation**

## 📚 Additional Resources

- [Google Analytics Setup Documentation](./analytics-setup.md)
- [CI/CD Analytics Setup](./cicd-analytics-setup.md)
- [GitHub Secrets Setup](./github-secrets-setup.md)
