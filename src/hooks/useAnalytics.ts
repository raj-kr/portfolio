"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackFormSubmission,
  trackExternalLink,
  trackScrollDepth,
  trackTimeOnPage,
} from "@/utils/analytics";

export const useAnalytics = () => {
  const pathname = usePathname();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track at 25%, 50%, 75%, and 100% scroll depth
      if ([25, 50, 75, 100].includes(scrollPercent)) {
        trackScrollDepth(scrollPercent);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 10) {
        // Only track if user spent more than 10 seconds
        trackTimeOnPage(timeSpent);
      }
    };
  }, [pathname]);

  return {
    trackEvent,
    trackButtonClick,
    trackFormSubmission,
    trackExternalLink,
    trackScrollDepth,
    trackTimeOnPage,
  };
};
