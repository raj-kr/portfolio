'use client';

import { GoogleAnalytics } from '@next/third-parties/google';

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalyticsComponent({ gaId }: GoogleAnalyticsProps) {
  return <GoogleAnalytics gaId={gaId} />;
}
