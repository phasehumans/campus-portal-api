/**
 * Jest Configuration for Campus Portal
 */
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
