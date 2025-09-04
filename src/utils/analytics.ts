// Google Analytics utility functions
import { GA_ID, isGAEnabled } from "@/config/analytics";

// Track page views
export const trackPageView = (url: string) => {
  if (!isGAEnabled || typeof window === "undefined") return;

  window.gtag("config", GA_ID, {
    page_path: url,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!isGAEnabled || typeof window === "undefined") return;

  const config: Record<string, string | number | boolean> = {
    event_category: category,
  };

  if (label !== undefined) {
    config.event_label = label;
  }

  if (value !== undefined) {
    config.value = value;
  }

  window.gtag("event", action, config);
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent(
    "click",
    "button",
    `${buttonName}${location ? ` - ${location}` : ""}`
  );
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
  trackEvent("submit", "form", formName);
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText?: string) => {
  trackEvent(
    "click",
    "external_link",
    `${linkText || "External Link"} - ${url}`
  );
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent("scroll", "engagement", `scroll_depth_${depth}%`);
};

// Track time on page
export const trackTimeOnPage = (seconds: number) => {
  trackEvent("timing_complete", "engagement", "time_on_page", seconds);
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
