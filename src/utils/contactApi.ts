// Contact API utility functions
import { getCurrentApiConfig, getDefaultHeaders } from "@/config/api";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string;
}

interface ContactApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send contact form data to API Gateway
 * @param formData - The contact form data
 * @returns Promise with API response
 */
export const sendContactMessage = async (
  formData: ContactFormData
): Promise<ContactApiResponse> => {
  try {
    const apiConfig = getCurrentApiConfig();
    if (!apiConfig.baseUrl) {
      return { success: false, error: 'Contact sending is disabled in local development. Configure a test API first.' };
    }
    const url = `${apiConfig.baseUrl}${apiConfig.contactEndpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(formData),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data?.success !== true) {
      return { success: false, error: 'The server did not confirm your message. Please try again.' };
    }

    return {
      success: true,
      message: data.message || "Message sent successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
};

/**
 * Test API connectivity
 * @returns Promise with test result
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const apiConfig = getCurrentApiConfig();
    if (!apiConfig.baseUrl) return false;
    const url = `${apiConfig.baseUrl}${apiConfig.contactEndpoint}`;

    // Check reachability only. OPTIONS never submits a form or sends an email.
    const response = await fetch(url, {
      method: "OPTIONS",
      headers: getDefaultHeaders(),
      signal: AbortSignal.timeout(10000),
    });

    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};

/**
 * Get API configuration (for debugging)
 * @returns API configuration object
 */
export const getApiConfig = () => {
  const apiConfig = getCurrentApiConfig();
  return {
    baseUrl: apiConfig.baseUrl,
    contactEndpoint: apiConfig.contactEndpoint,
    hasApiKey: !!import.meta.env.VITE_API_KEY,
    environment: import.meta.env.MODE,
  };
};
