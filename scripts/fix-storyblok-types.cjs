#!/usr/bin/env node

/**
 * This script adds custom type definitions for Storyblok to fix TypeScript errors
 * Run with: node scripts/fix-storyblok-types.cjs
 */

const fs = require('fs');
const path = require('path');

// Path to add the custom type definitions
const typeDefsPath = path.join(__dirname, '..', 'src', 'types', 'storyblok.d.ts');

// Create the types directory if it doesn't exist
const typesDir = path.dirname(typeDefsPath);
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Custom type definitions to extend Storyblok types
const typeDefinitions = `
// Custom type definitions for Storyblok SDK

import '@storyblok/react';

declare module '@storyblok/react' {
  export interface ISbConfig {
    bridge?: {
      resolveRelations?: string[];
      customParent?: string;
      additionalParams?: Record<string, string>;
    };
  }

  export interface ISbStoriesParams {
    cv?: string | number;
    resolve_relations?: string;
    [key: string]: any;
  }
}
`;

// Write the type definitions file
fs.writeFileSync(typeDefsPath, typeDefinitions);

console.log(`✅ Storyblok type definitions added at ${typeDefsPath}`);
console.log('Remember to include this file in your tsconfig.json if not already included.'); 