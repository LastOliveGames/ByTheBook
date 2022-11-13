/* eslint-env node */

module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  extends: [
    '../.eslintrc.cjs',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: ['tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
  ],
};
