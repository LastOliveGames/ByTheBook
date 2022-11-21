/* eslint-env node */

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'accessor-pairs': 'error',
    'array-bracket-spacing': 'warn',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'warn',
    'block-spacing': ['warn', 'never'],
    'brace-style': ['warn', '1tbs', {allowSingleLine: true}],
    'camelcase': 'error',
    'comma-spacing': 'warn',
    'comma-style': 'warn',
    'computed-property-spacing': 'warn',
    'curly': ['error', 'multi-line'],
    'dot-location': ['warn', 'property'],
    'dot-notation': 'warn',
    'eol-last': 'warn',
    'eqeqeq': 'error',
    'func-call-spacing': 'warn',
    'generator-star-spacing': 'warn',
    'getter-return': ['error', {allowImplicit: true}],
    'indent': ['warn', 2, {
      SwitchCase: 1,
      MemberExpression: 'off',
      FunctionDeclaration: {parameters: 'off'},
      FunctionExpression: {parameters: 'off'}
    }],
    'key-spacing': ['warn', {mode: 'minimum'}],
    'keyword-spacing': 'warn',
    'linebreak-style': 'warn',
    'lines-between-class-members': ['warn', 'always', {exceptAfterSingleLine: true}],
    'max-len': ['warn', {
      code: 100,
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
      ignorePattern: 'url\\(\'data:'
    }],
    'new-cap': 'error',
    'new-parens': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-bitwise': ['error', {allow: ['~']}],
    'no-caller': 'error',
    'no-console': 'off',
    'no-constant-condition': ['error', {checkLoops: false}],
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-multi-spaces': ['warn', {ignoreEOLComments: true}],
    'no-multi-str': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-negated-condition': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow-restricted-names': 'error',
    'no-tabs': 'warn',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'warn',
    'no-undef-init': 'error',
    'no-unexpected-multiline': 'off',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'error',
    'no-use-before-define': ['error', {functions: false}],
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'no-whitespace-before-property': 'warn',
    'no-with': 'error',
    'nonblock-statement-body-position': 'error',
    'object-curly-spacing': 'warn',
    'object-shorthand': 'error',
    'operator-linebreak': ['warn', 'after'],
    // 'prefer-arrow-callback': 'error',  // turned off due to Angular
    'prefer-const': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-promise-reject-errors': 'error',
    'quotes': ['error', 'single', {allowTemplateLiterals: true}],
    'radix': 'error',
    'rest-spread-spacing': 'warn',
    'semi': 'error',
    'semi-spacing': 'warn',
    'semi-style': 'warn',
    'space-before-blocks': 'warn',
    'space-before-function-paren':
      ['warn', {anonymous: 'never', named: 'never', asyncArrow: 'always'}],
    'space-in-parens': 'warn',
    'space-infix-ops': 'warn',
    'space-unary-ops': ['warn', {words: true, nonwords: false}],
    'spaced-comment': 'warn',
    'strict': ['error'],
    'switch-colon-spacing': 'warn',
    'template-curly-spacing': 'warn',
    'template-tag-spacing': 'warn',
    'unicode-bom': 'error',
    'yoda': 'error',

    // https://stackoverflow.com/a/63961972
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    // These two rules need to work together for correct typescript linting.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {args: 'none', varsIgnorePattern: '^unused'}],

    // Rules turned off for now
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  }
};

