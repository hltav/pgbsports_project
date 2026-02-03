/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|test)\\.ts$',

  // Configuração mais específica para ts-jest
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleNameMapping: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  setupFilesAfterEnv: [],

  verbose: true,
};
