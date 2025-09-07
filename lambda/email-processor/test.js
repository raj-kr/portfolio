const { handler } = require("./index");

// Test event simulating S3 trigger
const testEvent = {
  Records: [
    {
      eventSource: "aws:s3",
      s3: {
        bucket: {
          name: "myemail-log",
        },
        object: {
          key: "emails/test-email-1234567890.eml",
        },
      },
    },
  ],
};

// Test context
const testContext = {
  functionName: "email-processor",
  functionVersion: "$LATEST",
  invokedFunctionArn:
    "arn:aws:lambda:ap-south-1:016116087217:function:email-processor",
  memoryLimitInMB: "256",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/email-processor",
  logStreamName: "2025/09/06/[$LATEST]test-stream",
  getRemainingTimeInMillis: () => 30000,
};

console.log("🧪 Testing Email Processor Lambda Function...");
console.log("==============================================");

// Set environment variables for testing
process.env.AWS_REGION = "ap-south-1";
process.env.FROM_EMAIL = "mail@raj.kr";
process.env.TO_EMAIL = "rkgt76@gmail.com";

async function runTest() {
  try {
    console.log("📧 Test Event:", JSON.stringify(testEvent, null, 2));
    console.log("");

    const result = await handler(testEvent, testContext);

    console.log("✅ Test completed successfully!");
    console.log("📋 Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();
