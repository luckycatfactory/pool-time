module.exports = {
  collectCoverageFrom: [
    '**/*.js',
    '!*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/setUpTests.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  verbose: true,
};
