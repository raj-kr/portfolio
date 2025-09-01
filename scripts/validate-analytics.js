#!/usr/bin/env node

/**
 * Google Analytics Validation Script
 * Use this script in CI/CD pipelines to validate analytics setup
 */

const fs = require("fs");
const path = require("path");

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

function validateGAId(gaId) {
  if (!gaId) {
    log("❌ NEXT_PUBLIC_GA_ID environment variable is not set", "red");
    return false;
  }

  // Check GA ID format (G-XXXXXXXXXX)
  const gaIdPattern = /^G-[A-Z0-9]{10}$/;
  if (!gaIdPattern.test(gaId)) {
    log(`❌ Invalid GA ID format: ${gaId}`, "red");
    log(
      "Expected format: G-XXXXXXXXXX (where X are alphanumeric characters)",
      "yellow"
    );
    return false;
  }

  log(`✅ GA ID format is valid: ${gaId}`, "green");
  return true;
}

function checkBuildFiles() {
  const nextDir = path.join(process.cwd(), ".next");

  if (!fs.existsSync(nextDir)) {
    log('⚠️  .next directory not found. Run "npm run build" first.', "yellow");
    return false;
  }

  // Check if analytics files are present in build
  const staticDir = path.join(nextDir, "static");
  if (fs.existsSync(staticDir)) {
    log("✅ Build directory exists", "green");
    return true;
  }

  log("⚠️  Build directory structure may be incomplete", "yellow");
  return false;
}

function checkEnvironmentFiles() {
  const envFiles = [
    ".env.local",
    ".env.production",
    ".env.development",
    ".env",
  ];

  const existingEnvFiles = envFiles.filter((file) =>
    fs.existsSync(path.join(process.cwd(), file))
  );

  if (existingEnvFiles.length > 0) {
    log(`📁 Found environment files: ${existingEnvFiles.join(", ")}`, "blue");
  } else {
    log("⚠️  No environment files found", "yellow");
  }

  return existingEnvFiles.length > 0;
}

function main() {
  log("🔍 Google Analytics Validation", "blue");
  log("==============================", "blue");

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  let isValid = true;

  // Validate GA ID
  if (!validateGAId(gaId)) {
    isValid = false;
  }

  // Check environment files
  checkEnvironmentFiles();

  // Check build files (if available)
  checkBuildFiles();

  // Summary
  log("\n📊 Validation Summary:", "blue");
  if (isValid) {
    log("✅ Google Analytics is properly configured for CI/CD", "green");
    log(
      "💡 Remember to set NEXT_PUBLIC_GA_ID in your CI/CD environment variables",
      "blue"
    );
  } else {
    log("❌ Google Analytics configuration needs attention", "red");
    process.exit(1);
  }

  // Additional recommendations
  log("\n💡 Recommendations:", "blue");
  log(
    "1. Set different GA IDs for different environments (dev/staging/prod)",
    "blue"
  );
  log("2. Never commit GA IDs to version control", "blue");
  log("3. Use CI/CD environment variables for secure configuration", "blue");
  log("4. Test analytics in staging before deploying to production", "blue");
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = {
  validateGAId,
  checkBuildFiles,
  checkEnvironmentFiles,
};
