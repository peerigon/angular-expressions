{
  "name": "angular-expressions",
  "version": "1.0.0",
  "description": "Angular expressions as standalone module",
  "main": "./lib/main.js",
  "scripts": {
    "test": "mocha test/main.test.js -R spec",
    "test-browser": "webpack-dev-server 'mocha-loader!./test/main.test.js' --output-filename output.js --port 8081",
    "posttest": "eslint --fix lib test && prettier --write lib/*.js test/*.js"
  },
  "keywords": [
    "angular",
    "expression",
    "parser",
    "lexer",
    "parse",
    "eval",
    "source"
  ],
  "dependencies": {},
  "devDependencies": {
    "chai": "^3.2.0",
    "eslint": "^5.16.0",
    "mocha": "^7.0.0",
    "mocha-loader": "^4.0.1",
    "prettier": "^1.19.1",
    "webpack": "^4.41.5",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.10.1"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/peerigon/angular-expressions.git"
  },
  "testling": {
    "harness": "mocha",
    "files": "test/main.js",
    "browsers": [
      "ie/8..latest",
      "chrome/27..latest",
      "firefox/22..latest",
      "safari/latest",
      "opera/latest",
      "iphone/latest",
      "ipad/latest",
      "android-browser/latest"
    ]
  },
  "author": "peerigon <developers@peerigon.com>",
  "license": "Unlicense"
}
