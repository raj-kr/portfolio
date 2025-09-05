// Test script for the contact form Lambda function
const { handler } = require("./index");

// Mock event for testing (API Gateway format)
const mockEvent = {
  httpMethod: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Test Browser)",
  },
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    message: "This is a test message from the contact form.",
  }),
  requestContext: {
    identity: {
      sourceIp: "127.0.0.1",
    },
  },
};

// Mock event for Lambda test console (direct object format)
const mockEventDirect = {
  name: "Test User",
  email: "test@example.com",
  message: "This is a test message from the contact form.",
};

// Mock context
const mockContext = {
  functionName: "contact-form-handler",
  functionVersion: "1",
  invokedFunctionArn:
    "arn:aws:lambda:us-east-1:123456789012:function:contact-form-handler",
  memoryLimitInMB: "128",
  remainingTimeInMillis: 30000,
};

// Test function
async function testContactForm() {
  console.log("🧪 Testing Contact Form Lambda Function...\n");

  try {
    // Test valid submission (API Gateway format)
    console.log("1. Testing valid form submission (API Gateway format)...");
    const result = await handler(mockEvent, mockContext);

    console.log("Status Code:", result.statusCode);
    console.log("Headers:", result.headers);
    console.log("Body:", JSON.parse(result.body));

    if (result.statusCode === 200) {
      console.log("✅ Valid submission test passed!\n");
    } else {
      console.log("❌ Valid submission test failed!\n");
    }

    // Test valid submission (Direct object format - Lambda test console)
    console.log("2. Testing valid form submission (Direct object format)...");
    const resultDirect = await handler(mockEventDirect, mockContext);

    console.log("Status Code:", resultDirect.statusCode);
    console.log("Headers:", resultDirect.headers);
    console.log("Body:", JSON.parse(resultDirect.body));

    if (resultDirect.statusCode === 200) {
      console.log("✅ Direct object test passed!\n");
    } else {
      console.log("❌ Direct object test failed!\n");
    }

    // Test invalid email
    console.log("3. Testing invalid email format...");
    const invalidEmailEvent = {
      ...mockEvent,
      body: JSON.stringify({
        name: "Test User",
        email: "invalid-email",
        message: "Test message",
      }),
    };

    const invalidResult = await handler(invalidEmailEvent, mockContext);
    console.log("Status Code:", invalidResult.statusCode);
    console.log("Body:", JSON.parse(invalidResult.body));

    if (invalidResult.statusCode === 400) {
      console.log("✅ Invalid email test passed!\n");
    } else {
      console.log("❌ Invalid email test failed!\n");
    }

    // Test missing fields
    console.log("4. Testing missing required fields...");
    const missingFieldsEvent = {
      ...mockEvent,
      body: JSON.stringify({
        name: "Test User",
        // Missing email and message
      }),
    };

    const missingResult = await handler(missingFieldsEvent, mockContext);
    console.log("Status Code:", missingResult.statusCode);
    console.log("Body:", JSON.parse(missingResult.body));

    if (missingResult.statusCode === 400) {
      console.log("✅ Missing fields test passed!\n");
    } else {
      console.log("❌ Missing fields test failed!\n");
    }

    // Test CORS preflight
    console.log("5. Testing CORS preflight...");
    const corsEvent = {
      ...mockEvent,
      httpMethod: "OPTIONS",
    };

    const corsResult = await handler(corsEvent, mockContext);
    console.log("Status Code:", corsResult.statusCode);
    console.log("Headers:", corsResult.headers);

    if (corsResult.statusCode === 200) {
      console.log("✅ CORS preflight test passed!\n");
    } else {
      console.log("❌ CORS preflight test failed!\n");
    }

    console.log("🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run tests
testContactForm();
