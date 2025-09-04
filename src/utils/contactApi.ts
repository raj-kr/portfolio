// Contact API utility functions
import { getCurrentApiConfig, getDefaultHeaders } from "@/config/api";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
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
    const url = `${apiConfig.baseUrl}${apiConfig.contactEndpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Message sent successfully!",
    };
  } catch (error) {
    console.error("Error sending contact message:", error);

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
    const url = `${apiConfig.baseUrl}/health`; // Assuming you have a health endpoint

    const response = await fetch(url, {
      method: "GET",
      headers: getDefaultHeaders(),
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

// Example Lambda function structure for reference:
/*
// AWS Lambda function (Node.js)
exports.handler = async (event) => {
  try {
    // Parse the request body
    const { name, email, message } = JSON.parse(event.body);
    
    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields'
        })
      };
    }
    
    // Process the contact form (send email, save to database, etc.)
    // Example: Send email using SES
    // await sendEmail({ name, email, message });
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully!'
      })
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};
*/
