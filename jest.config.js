/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',

  // Transformação mais específica
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          esModuleInterop: true,
        },
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
