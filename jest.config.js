module.exports = {
  collectCoverageFrom: [
    '**/*.js',
    '!*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  verbose: true,
};
