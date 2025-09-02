# Production Analytics Verification Guide

This guide shows how to verify that Google Analytics is working correctly in your production environment.

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables Setup

Ensure your production environment has the correct GA ID:

```bash
# In your CI/CD platform (GitHub Actions, Vercel, Netlify, etc.)
NEXT_PUBLIC_GA_ID=G-YOUR-PRODUCTION-ID
```

### 2. Build Verification

Before deploying, verify the build includes analytics:

```bash
# Test build locally with production GA ID
NEXT_PUBLIC_GA_ID=G-YOUR-PRODUCTION-ID npm run build

# Validate analytics configuration
NEXT_PUBLIC_GA_ID=G-YOUR-PRODUCTION-ID npm run validate:analytics
```

## 🔍 Production Verification Methods

### Method 1: Browser Developer Tools

1. **Open your production website**
2. **Open Developer Tools** (F12)
3. **Go to Console Tab**:
   - Look for analytics-related messages
   - Check for any errors
4. **Go to Network Tab**:
   - Filter by "google-analytics" or "gtag"
   - Look for requests to Google Analytics domains

**Expected Network Requests:**
```
https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID
https://www.google-analytics.com/g/collect
```

### Method 2: Google Analytics Real-Time Reports

1. **Go to Google Analytics Dashboard**
2. **Navigate to Reports → Real-time**
3. **Visit your production site**
4. **Check if your visit appears in real-time data**

### Method 3: Browser Extensions

Install these browser extensions for quick verification:

- **Google Analytics Debugger** (Chrome/Firefox)
- **GA Checker** (Chrome)
- **Google Tag Assistant** (Chrome)

### Method 4: Manual Testing

Test custom events in production:

```javascript
// Open browser console on your production site
// Test if gtag is available
console.log(typeof window.gtag); // Should return "function"

// Test sending a custom event
window.gtag('event', 'test_event', {
  event_category: 'production_test',
  event_label: 'manual_test',
  value: 1
});
```

## 🛠️ Production Testing Tools

### 1. Create Production Test Script

Create a production test script to verify analytics:

```bash
# Create production test
npm run test:analytics:production
```

### 2. Automated Production Checks

Add these checks to your CI/CD pipeline:

```yaml
# In your GitHub Actions workflow
- name: Production Analytics Check
  run: |
    # Check if production site loads analytics
    curl -s https://your-production-site.com | grep -q "googletagmanager.com" && echo "✅ Analytics script found" || echo "❌ Analytics script missing"
```

## 📊 Verification Checklist

### ✅ Basic Functionality

- [ ] Production site loads without errors
- [ ] Google Analytics script loads (check Network tab)
- [ ] No console errors related to analytics
- [ ] Real-time data appears in GA dashboard

### ✅ Event Tracking

- [ ] Page views are tracked
- [ ] Custom events work (if implemented)
- [ ] Button clicks are tracked (if implemented)
- [ ] Form submissions are tracked (if implemented)

### ✅ Performance

- [ ] Analytics doesn't slow down page load
- [ ] No blocking requests to analytics domains
- [ ] Analytics loads asynchronously

### ✅ Privacy & Compliance

- [ ] Analytics respects user privacy settings
- [ ] No personal data is collected
- [ ] GDPR compliance (if applicable)

## 🔧 Troubleshooting Production Issues

### Analytics Not Loading

**Check:**
1. Is `NEXT_PUBLIC_GA_ID` set correctly in production?
2. Are there any ad blockers blocking analytics?
3. Are there network connectivity issues?
4. Is the GA ID valid and active?

**Solutions:**
```bash
# Verify environment variable in production
echo $NEXT_PUBLIC_GA_ID

# Check if GA ID is valid
curl -s "https://www.google-analytics.com/g/collect" -H "User-Agent: Test"
```

### No Data in Google Analytics

**Possible Causes:**
1. GA ID is incorrect or inactive
2. Analytics is blocked by ad blockers
3. Data processing delay (up to 24-48 hours)
4. Wrong GA property selected

**Solutions:**
1. Verify GA ID in Google Analytics dashboard
2. Check real-time reports for immediate data
3. Wait 24-48 hours for processed data
4. Test with different browsers/devices

### Performance Issues

**Check:**
1. Analytics script loading time
2. Impact on page load speed
3. Network requests to analytics domains

**Solutions:**
1. Use Google Analytics 4 (GA4) for better performance
2. Implement lazy loading for analytics
3. Use Next.js third-parties package (already implemented)

## 🎯 Advanced Verification

### 1. Custom Event Testing

Test your custom analytics events in production:

```typescript
// Add this to a production page for testing
import { useAnalytics } from '@/hooks/useAnalytics';

function ProductionTest() {
  const { trackButtonClick, trackEvent } = useAnalytics();
  
  const testAnalytics = () => {
    trackButtonClick('Production Test Button', 'homepage');
    trackEvent('production_test', 'verification', 'manual_test');
    console.log('Production analytics test completed');
  };
  
  return (
    <button onClick={testAnalytics}>
      Test Production Analytics
    </button>
  );
}
```

### 2. A/B Testing Verification

If you're using A/B testing:

```javascript
// Test A/B testing with analytics
window.gtag('event', 'ab_test', {
  event_category: 'experiment',
  event_label: 'test_variant_a',
  value: 1
});
```

### 3. E-commerce Tracking

If you have e-commerce tracking:

```javascript
// Test e-commerce events
window.gtag('event', 'purchase', {
  transaction_id: 'test_123',
  value: 25.42,
  currency: 'USD',
  items: [{
    item_id: 'test_item',
    item_name: 'Test Product',
    category: 'Test Category',
    quantity: 1,
    price: 25.42
  }]
});
```

## 📈 Monitoring & Alerts

### 1. Set Up Monitoring

Monitor analytics in production:

```bash
# Check analytics health regularly
curl -s https://your-site.com | grep -q "googletagmanager.com" && echo "Analytics OK" || echo "Analytics DOWN"
```

### 2. Google Analytics Alerts

Set up alerts in Google Analytics:
1. Go to Admin → Intelligence insights
2. Create custom alerts for:
   - Sudden traffic drops
   - Unusual traffic patterns
   - Analytics errors

### 3. Uptime Monitoring

Use services like:
- **UptimeRobot**
- **Pingdom**
- **StatusCake**

To monitor if your analytics are loading properly.

## 🔒 Security Considerations

### Production Security

- ✅ Use different GA IDs for different environments
- ✅ Never expose GA IDs in client-side code
- ✅ Monitor for unusual analytics data
- ✅ Regularly audit analytics implementation

### Data Privacy

- ✅ Respect user privacy settings
- ✅ Implement cookie consent (if required)
- ✅ Follow GDPR/CCPA guidelines
- ✅ Provide opt-out mechanisms

## 📋 Production Deployment Checklist

Before going live:

- [ ] Production GA ID is set correctly
- [ ] Analytics loads without errors
- [ ] Real-time data appears in GA dashboard
- [ ] Custom events work correctly
- [ ] Performance impact is acceptable
- [ ] Privacy compliance is maintained
- [ ] Monitoring is set up
- [ ] Alerts are configured

## 🆘 Emergency Procedures

### If Analytics Stops Working

1. **Check environment variables**
2. **Verify GA ID is still valid**
3. **Check for ad blocker issues**
4. **Review recent code changes**
5. **Check Google Analytics service status**

### Rollback Plan

If analytics causes issues:

1. **Disable analytics temporarily**:
   ```bash
   # Remove GA ID from environment variables
   unset NEXT_PUBLIC_GA_ID
   ```

2. **Redeploy without analytics**
3. **Investigate and fix issues**
4. **Re-enable analytics after fixes**

## 📚 Additional Resources

- [Google Analytics Help Center](https://support.google.com/analytics/)
- [GA4 Debugging Guide](https://developers.google.com/analytics/devguides/collection/ga4/debug)
- [Next.js Analytics Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Local Testing Guide](./local-testing-guide.md)
- [CI/CD Analytics Setup](./cicd-analytics-setup.md)
