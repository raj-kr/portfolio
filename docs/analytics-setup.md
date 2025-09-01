# Google Analytics Setup

This project has been configured with Google Analytics 4 (GA4) using Next.js third-parties package.

## Setup Instructions

### 1. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Get your Measurement ID (starts with "G-")

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add your GA ID:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

### 3. Verify Installation

1. Start your development server: `npm run dev`
2. Open your website
3. Check the browser's developer tools Network tab
4. You should see requests to `google-analytics.com`

## Features Included

### Automatic Tracking
- **Page Views**: Automatically tracks all page navigation
- **Scroll Depth**: Tracks when users scroll 25%, 50%, 75%, and 100%
- **Time on Page**: Tracks how long users spend on each page

### Manual Tracking Functions

The project includes utility functions for custom event tracking:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const { trackButtonClick, trackExternalLink } = useAnalytics();

// Track button clicks
trackButtonClick('Contact Form Submit', 'hero-section');

// Track external link clicks
trackExternalLink('https://github.com/username', 'GitHub Profile');
```

### Available Tracking Functions

- `trackEvent(action, category, label?, value?)` - Custom events
- `trackButtonClick(buttonName, location?)` - Button interactions
- `trackFormSubmission(formName)` - Form submissions
- `trackExternalLink(url, linkText?)` - External link clicks
- `trackScrollDepth(depth)` - Scroll depth tracking
- `trackTimeOnPage(seconds)` - Time spent on page

## Privacy Considerations

- Analytics only runs when `NEXT_PUBLIC_GA_ID` is properly configured
- Respects user privacy settings
- No personal data is collected
- Analytics can be disabled by not setting the environment variable

## Testing

To test analytics in development:

1. Set your GA ID in `.env.local`
2. Open browser developer tools
3. Check the Console for any analytics-related errors
4. Verify events are being sent to Google Analytics

## Production Deployment

When deploying to production:

1. Set the `NEXT_PUBLIC_GA_ID` environment variable in your hosting platform
2. Ensure the environment variable is properly configured
3. Test analytics tracking in the production environment

## Troubleshooting

- **Analytics not working**: Check that `NEXT_PUBLIC_GA_ID` is set correctly
- **Events not showing**: Wait 24-48 hours for data to appear in GA dashboard
- **Development vs Production**: Analytics works in both environments when properly configured
