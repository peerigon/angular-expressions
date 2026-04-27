export default {
  rules: {
    "no-undef": "error",
    "no-use-before-define": ["error", { functions: false, classes: true }],
  },
};
