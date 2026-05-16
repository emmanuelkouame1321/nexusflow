module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Import ESM
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',

    // Autoriser les imports depuis les workspaces (shared)
    'import/no-extraneous-dependencies': ['error', { devDependencies: true, optionalDependencies: false, peerDependencies: false }],

    // Console tolérée en développement
    'no-console': 'warn',

    // Désactiver les règles qui causent des faux positifs avec Express/async
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-param-reassign': 'off',
    'no-use-before-define': 'off',
    'no-nested-ternary': 'off',
  },
};