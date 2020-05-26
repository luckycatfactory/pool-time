module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testPathIgnorePatterns: ['/coverage/', '/dist/', '/node_modules/'],
  verbose: true,
};
