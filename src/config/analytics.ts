// Google Analytics Configuration
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

// Check if GA ID is properly configured
export const isGAEnabled = GA_ID !== "G-XXXXXXXXXX" && GA_ID.length > 0;
