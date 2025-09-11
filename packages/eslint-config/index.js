module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off', // Disable for TypeScript files since TS handles this
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-undef': 'off', // Disable for TypeScript files since TS handles this
    'no-redeclare': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      // For TypeScript files, just disable problematic rules
      // The real linting should be handled by the TypeScript compiler
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
  ],
};