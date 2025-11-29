// /** @type {import('jest').Config} */
// module.exports = {
//   preset: 'ts-jest/presets/default',
//   testEnvironment: 'tsconfig.test.json',
//   moduleFileExtensions: ['js', 'json', 'ts'],
//   rootDir: 'src',
//   testRegex: '.*\\.spec\\.ts$',

//   transform: {
//     '^.+\\.(t|j)s$': [
//       'ts-jest',
//       {
//         tsconfig: 'tsconfig.test.json',
//       },
//     ],
//   },

//   collectCoverageFrom: ['**/*.(t|j)s'],
//   coverageDirectory: '../coverage',

//   transformIgnorePatterns: [],

//   extensionsToTreatAsEsm: [],

//   moduleNameMapper: {},

//   resolver: undefined,

//   cache: false,
//   cacheDirectory: 'jest-cache',

//   setupFilesAfterEnv: [],

//   verbose: true,

//   forceExit: true,

//   detectOpenHandles: true,
// };

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
