'use client';

import { useEffect, useState } from 'react';
import { GA_ID, isGAEnabled } from '@/config/analytics';

interface AnalyticsStatus {
  isLoaded: boolean;
  hasGtag: boolean;
  hasRequests: boolean;
  gaId: string | null;
  errors: string[];
}

export default function AnalyticsDebugger() {
  const [status, setStatus] = useState<AnalyticsStatus>({
    isLoaded: false,
    hasGtag: false,
    hasRequests: false,
    gaId: null,
    errors: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true';
    
    if (!shouldShow) return;

    const checkAnalytics = () => {
      const newStatus: AnalyticsStatus = {
        isLoaded: false,
        hasGtag: false,
        hasRequests: false,
        gaId: null,
        errors: []
      };

      // Check if analytics is enabled
      if (!isGAEnabled) {
        newStatus.errors.push('Analytics is disabled (NEXT_PUBLIC_GA_ID not set)');
        setStatus(newStatus);
        return;
      }

      // Check if gtag is available
      if (typeof window !== 'undefined') {
        newStatus.hasGtag = typeof window.gtag === 'function';
        newStatus.gaId = GA_ID;
        
        if (!newStatus.hasGtag) {
          newStatus.errors.push('gtag function not available');
        }
      }

      // Check for analytics requests (simplified check)
      if (typeof window !== 'undefined' && window.performance) {
        const entries = window.performance.getEntriesByType('resource');
        const hasAnalyticsRequests = entries.some(entry => 
          entry.name.includes('google-analytics.com') || 
          entry.name.includes('googletagmanager.com')
        );
        newStatus.hasRequests = hasAnalyticsRequests;
      }

      newStatus.isLoaded = true;
      setStatus(newStatus);
    };

    // Check immediately
    checkAnalytics();

    // Check again after a delay to allow analytics to load
    const timeout = setTimeout(checkAnalytics, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && 
      process.env.NEXT_PUBLIC_DEBUG_ANALYTICS !== 'true') {
    return null;
  }

  const getStatusColor = () => {
    if (status.errors.length > 0) return 'text-red-500';
    if (status.hasGtag && status.hasRequests) return 'text-green-500';
    if (status.hasGtag || status.hasRequests) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (status.errors.length > 0) return '❌ Issues Found';
    if (status.hasGtag && status.hasRequests) return '✅ Working';
    if (status.hasGtag || status.hasRequests) return '⚠️ Partial';
    return '❓ Unknown';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isVisible 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-800 shadow-lg border'
        }`}
        title="Analytics Debugger"
      >
        📊 Analytics
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Analytics Status</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Analytics Enabled:</span>
                <span className={isGAEnabled ? 'text-green-600' : 'text-red-600'}>
                  {isGAEnabled ? '✅' : '❌'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>GA ID:</span>
                <span className="font-mono text-xs">
                  {status.gaId || 'Not set'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>gtag Function:</span>
                <span className={status.hasGtag ? 'text-green-600' : 'text-red-600'}>
                  {status.hasGtag ? '✅' : '❌'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Network Requests:</span>
                <span className={status.hasRequests ? 'text-green-600' : 'text-yellow-600'}>
                  {status.hasRequests ? '✅' : '⏳'}
                </span>
              </div>
            </div>

            {status.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-red-600 mb-2">Issues:</h4>
                <ul className="space-y-1">
                  {status.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 pt-3 border-t">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'debug_test', {
                      event_category: 'debug',
                      event_label: 'manual_test',
                      value: 1
                    });
                    alert('Test event sent to Google Analytics!');
                  } else {
                    alert('gtag function not available');
                  }
                }}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Send Test Event
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>Debug mode: {process.env.NEXT_PUBLIC_DEBUG_ANALYTICS || 'false'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
