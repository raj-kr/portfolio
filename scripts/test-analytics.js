#!/usr/bin/env node

/**
 * Google Analytics Test Script
 * Use this script to test if analytics is working in the browser
 */

const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=");
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateTestHTML() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    log("❌ NEXT_PUBLIC_GA_ID not set", "red");
    return false;
  }

  const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Test</title>
</head>
<body>
    <h1>Google Analytics Test Page</h1>
    <p>This page tests if Google Analytics is working correctly.</p>
    
    <div id="status">Checking analytics...</div>
    
    <script>
        // Test if gtag is available
        function testAnalytics() {
            const statusDiv = document.getElementById('status');
            
            if (typeof window.gtag === 'function') {
                statusDiv.innerHTML = '✅ Google Analytics is working!';
                statusDiv.style.color = 'green';
                
                // Test sending a custom event
                window.gtag('event', 'test_event', {
                    event_category: 'test',
                    event_label: 'analytics_test',
                    value: 1
                });
                
                console.log('✅ Analytics test event sent successfully');
            } else {
                statusDiv.innerHTML = '❌ Google Analytics not found';
                statusDiv.style.color = 'red';
                console.error('❌ gtag function not available');
            }
        }
        
        // Wait for analytics to load
        setTimeout(testAnalytics, 2000);
    </script>
</body>
</html>`;

  const testPath = path.join(process.cwd(), "analytics-test.html");
  fs.writeFileSync(testPath, testHTML);

  log(`📄 Test HTML file created: ${testPath}`, "blue");
  log("🌐 Open this file in a browser to test analytics", "blue");
  log(
    "📊 Check browser console and network tab for analytics requests",
    "blue"
  );

  return true;
}

function main() {
  log("🧪 Google Analytics Test", "blue");
  log("======================", "blue");

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    log("❌ NEXT_PUBLIC_GA_ID environment variable is not set", "red");
    log("💡 Set the environment variable to test analytics", "yellow");
    return;
  }

  log(`✅ GA ID found: ${gaId}`, "green");

  if (generateTestHTML()) {
    log("\n📋 Next Steps:", "blue");
    log("1. Open analytics-test.html in your browser", "blue");
    log("2. Check the browser console for analytics messages", "blue");
    log("3. Check Network tab for requests to google-analytics.com", "blue");
    log(
      "4. Verify in Google Analytics dashboard that events are received",
      "blue"
    );
  }
}

// Run test
if (require.main === module) {
  main();
}

module.exports = {
  generateTestHTML,
};
