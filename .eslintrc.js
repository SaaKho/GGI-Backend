module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier', // Add prettier to avoid conflicts
    ],
    plugins: ['@typescript-eslint'],
    env: {
      node: true,
      es6: true,
    },
    rules: {
      // Add custom rules here
      'no-console': 'off', // Allow console.log for this project
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Since we're using the REST Countries API
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  };