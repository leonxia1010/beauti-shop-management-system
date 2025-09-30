export default {
  displayName: 'api-gateway',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-gateway',
  testMatch: [
    '<rootDir>/src/**/*.(test|spec).ts',
    '<rootDir>/test/**/*.(test|spec).ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapping: {
    '^@beauty-shop/(.*)$': '<rootDir>/../../libs/$1/src/index.ts',
  },
};
