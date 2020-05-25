module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!**/*.d.ts'],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/coverage/', '/dist/', '/node_modules/'],
  verbose: true,
};
