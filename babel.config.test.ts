export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { 
      runtime: 'automatic',
      importSource: 'react'  // Explicitly set React as the JSX runtime source
    }],
  ],
  // Only apply this config in test environment
  ignore: [
    // Ignore everything by default
    /node_modules/,
    /\.next/,
    // Except test files
    function(filepath: string) {
      return process.env.NODE_ENV === 'test' && 
             (/\/__tests__\/.*\.(js|jsx|ts|tsx)$/.test(filepath) ||
              /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(filepath));
    },
  ],
}; 