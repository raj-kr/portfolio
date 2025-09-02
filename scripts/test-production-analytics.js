#!/usr/bin/env node

/**
 * Production Analytics Test Script
 * Use this script to test Google Analytics in production
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

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

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? https : http;

    const req = protocol.request(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function testProductionAnalytics(productionUrl) {
  log("🔍 Production Analytics Test", "blue");
  log("============================", "blue");

  if (!productionUrl) {
    log("❌ Production URL is required", "red");
    log(
      "Usage: node scripts/test-production-analytics.js <production-url>",
      "yellow"
    );
    process.exit(1);
  }

  try {
    log(`🌐 Testing: ${productionUrl}`, "blue");

    // Test 1: Check if site loads
    log("\n📡 Testing site accessibility...", "blue");
    const response = await makeRequest(productionUrl);

    if (response.statusCode === 200) {
      log("✅ Site is accessible", "green");
    } else {
      log(`⚠️  Site returned status: ${response.statusCode}`, "yellow");
    }

    // Test 2: Check for Google Analytics script
    log("\n🔍 Checking for Google Analytics...", "blue");

    const hasGoogleAnalytics = response.data.includes("googletagmanager.com");
    const hasGtag = response.data.includes("gtag");
    const hasGoogleAnalyticsG = response.data.includes("google-analytics.com");

    if (hasGoogleAnalytics) {
      log("✅ Google Tag Manager script found", "green");
    } else {
      log("❌ Google Tag Manager script not found", "red");
    }

    if (hasGtag) {
      log("✅ gtag function found", "green");
    } else {
      log("❌ gtag function not found", "red");
    }

    if (hasGoogleAnalyticsG) {
      log("✅ Google Analytics 4 script found", "green");
    } else {
      log("❌ Google Analytics 4 script not found", "red");
    }

    // Test 3: Extract GA ID if found
    log("\n🔍 Extracting Google Analytics ID...", "blue");
    const gaIdMatch = response.data.match(/gtag\/js\?id=([A-Z0-9-]+)/);

    if (gaIdMatch) {
      const gaId = gaIdMatch[1];
      log(`✅ Google Analytics ID found: ${gaId}`, "green");

      // Validate GA ID format
      if (/^G-[A-Z0-9]{10}$/.test(gaId)) {
        log("✅ GA ID format is valid", "green");
      } else {
        log("⚠️  GA ID format may be invalid", "yellow");
      }
    } else {
      log("❌ Google Analytics ID not found", "red");
    }

    // Test 4: Check for Next.js third-parties
    log("\n🔍 Checking for Next.js third-parties...", "blue");
    const hasThirdParties = response.data.includes("@next/third-parties");

    if (hasThirdParties) {
      log("✅ Next.js third-parties package detected", "green");
    } else {
      log("ℹ️  Next.js third-parties not found (may be optimized out)", "blue");
    }

    // Test 5: Check for analytics component
    log("\n🔍 Checking for analytics component...", "blue");
    const hasAnalyticsComponent = response.data.includes("GoogleAnalytics");

    if (hasAnalyticsComponent) {
      log("✅ Google Analytics component found", "green");
    } else {
      log(
        "ℹ️  Google Analytics component not found (may be optimized out)",
        "blue"
      );
    }

    // Summary
    log("\n📊 Production Analytics Summary:", "blue");
    log("===============================", "blue");

    const allChecks = [hasGoogleAnalytics, hasGtag, hasGoogleAnalyticsG];
    const passedChecks = allChecks.filter(Boolean).length;

    if (passedChecks === allChecks.length) {
      log("✅ All analytics checks passed!", "green");
      log("🎉 Google Analytics is properly configured in production", "green");
    } else if (passedChecks > 0) {
      log(
        `⚠️  ${passedChecks}/${allChecks.length} analytics checks passed`,
        "yellow"
      );
      log("🔧 Some analytics components may need attention", "yellow");
    } else {
      log("❌ No analytics components found", "red");
      log("🚨 Google Analytics may not be working in production", "red");
    }

    // Recommendations
    log("\n💡 Next Steps:", "blue");
    log("1. Visit your production site in a browser", "blue");
    log("2. Open Developer Tools (F12)", "blue");
    log("3. Check Console tab for analytics messages", "blue");
    log("4. Check Network tab for analytics requests", "blue");
    log("5. Verify data appears in Google Analytics dashboard", "blue");
  } catch (error) {
    log(`❌ Error testing production site: ${error.message}`, "red");
    process.exit(1);
  }
}

// Get production URL from command line arguments
const productionUrl = process.argv[2];

// Run the test
if (require.main === module) {
  testProductionAnalytics(productionUrl);
}

module.exports = {
  testProductionAnalytics,
};
