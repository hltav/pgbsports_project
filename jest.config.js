/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.test.json',
      },
    ],
  },

  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',

  transformIgnorePatterns: [],

  extensionsToTreatAsEsm: [],

  moduleNameMapper: {},

  resolver: undefined,

  cache: false,
  cacheDirectory: '<rootDir>/../.jest-cache',

  setupFilesAfterEnv: [],

  verbose: true,

  forceExit: true,

  detectOpenHandles: true,
};
