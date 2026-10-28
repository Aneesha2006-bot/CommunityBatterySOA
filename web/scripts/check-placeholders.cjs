/**
 * Validation Script: check-placeholders.cjs
 * Requirement W-BIZ:
 * Checks whether production mode has missing business information,
 * placeholders, or dummy addresses/registration numbers.
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config/business.ts');
const content = fs.readFileSync(configPath, 'utf8');

const isProduction = process.env.VITE_SITE_MODE === 'production' || process.env.NODE_ENV === 'production';

console.log(`[Check-Placeholders] Mode: ${isProduction ? 'PRODUCTION' : 'DEMO'}`);

if (isProduction) {
  const missingPatterns = [
    /registrationNumber:\s*null/,
    /registeredAddress:\s*null/,
    /MISSING_/,
    /TODO/i,
  ];

  let hasError = false;
  for (const pattern of missingPatterns) {
    if (pattern.test(content)) {
      console.error(`[CRITICAL] Production build failed: Business detail missing or placeholder detected matching ${pattern}`);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('To run production builds, supply genuine business entity details in src/config/business.ts.');
    process.exit(1);
  } else {
    console.log('[Check-Placeholders] All required production business credentials supplied.');
  }
} else {
  console.log('[Check-Placeholders] Demo mode active: Synthetic placeholders permitted and documented.');
}
