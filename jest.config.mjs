import { createJsWithTsEsmPreset } from 'ts-jest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('jest').Config} */
const config = {
  ...createJsWithTsEsmPreset({
    tsconfig: './tsconfig.json'
  }),
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: './tsconfig.json',
      babelConfig: './babel.config.test.ts',
      jsx: 'react-jsx'
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      configFile: './babel.config.test.ts'
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@babel|@testing-library|@headlessui|@heroicons|@paypal|@supabase|@tanstack|@trpc|date-fns|next|react|react-dom|zod)/)'
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/src']
};

export default config; 