#!/usr/bin/env node

/**
 * This script checks if the Storyblok API is properly configured and accessible
 * Run with: node scripts/check-storyblok.cjs
 */

const dotenv = require('dotenv');
const path = require('path');
// Import fetch properly for CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Using the US region endpoint for Storyblok
const STORYBLOK_API_URL = 'https://api-us.storyblok.com/v2/cdn';

// Create cache version timestamp for cache busting
const CACHE_VERSION = Math.floor(Date.now() / 1000);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Log with colors
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkStoryblokConnection() {
  log('Checking Storyblok Configuration...', colors.cyan);
  console.log('');

  // Check environment variables
  let hasErrors = false;
  
  const requiredVars = [
    'STORYBLOK_PUBLIC_TOKEN',
    'STORYBLOK_PREVIEW_TOKEN',
    'NEXT_PUBLIC_STORYBLOK_API_TOKEN',
    'STORYBLOK_SPACE_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log(`❌ Missing environment variable: ${varName}`, colors.red);
      hasErrors = true;
    } else {
      log(`✅ ${varName} is defined`, colors.green);
    }
  }
  
  console.log('');
  
  // Check if the tokens are properly formatted
  const publicToken = process.env.STORYBLOK_PUBLIC_TOKEN;
  const previewToken = process.env.STORYBLOK_PREVIEW_TOKEN;
  
  if (publicToken && publicToken.length < 10) {
    log(`⚠️ STORYBLOK_PUBLIC_TOKEN appears to be too short, might be invalid`, colors.yellow);
    hasErrors = true;
  }
  
  if (previewToken && previewToken.length < 10) {
    log(`⚠️ STORYBLOK_PREVIEW_TOKEN appears to be too short, might be invalid`, colors.yellow);
    hasErrors = true;
  }
  
  // Check API connection with public token
  try {
    const url = `${STORYBLOK_API_URL}/stories/home?cv=${CACHE_VERSION}&token=${publicToken}&version=published`;
    log(`Testing published content with public token...`, colors.cyan);
    log(`URL: ${url}`, colors.blue);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Successfully connected to Storyblok API with public token!`, colors.green);
      
      if (data.story) {
        log(`✅ Home story found with name: ${data.story.name}`, colors.green);
      } else {
        log(`⚠️ Connection successful but home story not found with public token.`, colors.yellow);
        hasErrors = true;
      }
    } else {
      log(`❌ API request with public token failed with status ${response.status}`, colors.red);
      console.log('Response:', data);
      hasErrors = true;
    }
  } catch (error) {
    log(`❌ Failed to connect to Storyblok API with public token: ${error.message}`, colors.red);
    hasErrors = true;
  }
  
  // Check API connection with preview token (more likely to work in development)
  try {
    const url = `${STORYBLOK_API_URL}/stories/home?cv=${CACHE_VERSION}&token=${previewToken}&version=draft`;
    log(`\nTesting draft content with preview token...`, colors.cyan);
    log(`URL: ${url}`, colors.blue);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === 200) {
      log(`✅ Successfully connected to Storyblok API with preview token!`, colors.green);
      
      if (data.story) {
        log(`✅ Home story found with name: ${data.story.name}`, colors.green);
      } else {
        log(`⚠️ Connection successful but home story not found with preview token.`, colors.yellow);
        hasErrors = true;
      }
    } else {
      log(`❌ API request with preview token failed with status ${response.status}`, colors.red);
      console.log('Response:', data);
      hasErrors = true;
    }
  } catch (error) {
    log(`❌ Failed to connect to Storyblok API with preview token: ${error.message}`, colors.red);
    hasErrors = true;
  }
  
  console.log('');
  if (hasErrors) {
    log('⚠️ Some issues were detected with your Storyblok setup. Please fix them before continuing.', colors.yellow);
  } else {
    log('🎉 All checks passed! Your Storyblok configuration appears to be working correctly.', colors.green);
  }
}

checkStoryblokConnection().catch(error => {
  log(`❌ Error running check script: ${error.message}`, colors.red);
  process.exit(1);
}); 