/* eslint-env node */

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue', '.css'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: __dirname
      }
    }
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

