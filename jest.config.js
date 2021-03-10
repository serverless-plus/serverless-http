const isDebug = process.env.DEBUG === 'true';

const config = {
  verbose: true,
  silent: !isDebug,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  forceExit: true,
  testTimeout: 5000,
  testEnvironment: 'node',
  testRegex: '/__tests__/.*\\.(test|spec)\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/fixtures/', '/examples/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = config;
