module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    "space-before-function-paren": 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-buffer-constructor': 2,
    'new-cap': 0,
    'no-extend-native': ["error", { "exceptions": ["Array"] }],
    // allow debugger during development
    'no-eq-null': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
