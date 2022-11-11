/* eslint-env node */

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue'],
  extends: [
    '../.eslintrc.cjs',
    'plugin:vue/essential',
  ],
  ignorePatterns: ['components.d.ts'],
  rules: {
    'vue/block-lang': ['error', {script: {lang: 'ts'}}],
  }
};

