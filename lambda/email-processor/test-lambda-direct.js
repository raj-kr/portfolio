const { handler } = require("./index");

// Test the Lambda function directly with a real S3 event
const testEvent = {
  Records: [
    {
      eventSource: "aws:s3",
      s3: {
        bucket: {
          name: "myemail-log",
        },
        object: {
          key: "emails/test-complete-1757227664.eml",
        },
      },
    },
  ],
};

const testContext = {
  functionName: "email-processor",
  functionVersion: "$LATEST",
  invokedFunctionArn:
    "arn:aws:lambda:ap-south-1:016116087217:function:email-processor",
  memoryLimitInMB: "256",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/email-processor",
  logStreamName: "2025/09/07/[$LATEST]test-stream",
  getRemainingTimeInMillis: () => 30000,
};

// Set environment variables
process.env.AWS_REGION = "ap-south-1";
process.env.FROM_EMAIL = "mail@raj.kr";
process.env.TO_EMAIL = "rkgt76@gmail.com";

console.log("🧪 Testing Lambda Function Directly...");
console.log("=====================================");
console.log("📧 Test Event:", JSON.stringify(testEvent, null, 2));
console.log("");

async function runTest() {
  try {
    const result = await handler(testEvent, testContext);
    console.log("✅ Test completed successfully!");
    console.log("📋 Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

runTest();
