// Development sends are disabled until a test API is explicitly configured.
const developmentBaseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL?.trim().replace(/\/$/, '') || '';

export const API_CONFIG = {
  // Production API Gateway URL
  production: {
    baseUrl: "https://kxoak0t3ik.execute-api.ap-south-1.amazonaws.com/prod",
    contactEndpoint: "/contact",
  },

  // Development/Staging API Gateway URL
  development: {
    baseUrl: developmentBaseUrl,
    contactEndpoint: "/contact",
  },

  // Local development (if you have a local API server)
  local: {
    baseUrl: developmentBaseUrl,
    contactEndpoint: "/contact",
  },
};

// Get current API configuration based on environment
export const getCurrentApiConfig = () => {
  const environment = import.meta.env.MODE || "development";

  switch (environment) {
    case "production":
      return API_CONFIG.production;
    case "development":
      return API_CONFIG.development;
    default:
      return API_CONFIG.local;
  }
};

// API Key configuration (if required)
export const API_KEY = import.meta.env.VITE_API_KEY || "";

// Default headers for API requests
export const getDefaultHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  return headers;
};
