export default {
  env: {
    browser: true,
    es6: false,
  },
  rules: {
    "no-undef": "error",
    "no-use-before-define": ["error", { functions: false, classes: true }],
  },
};
