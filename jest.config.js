module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.(wav|mp3|m4a|aac)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
