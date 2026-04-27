# angular-expressions

**[angular's nicest part](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js) extracted as a standalone module for the browser and node.**

[![build status](https://travis-ci.org/peerigon/angular-expressions.svg)](http://travis-ci.org/peerigon/angular-expressions)

**angular-expressions** exposes a `.compile()`-method which can be used to compile evaluable expressions:

```javascript
var expressions = require("angular-expressions");

evaluate = expressions.compile("1 + 1");
evaluate(); // returns 2
```

You can also set and get values on a given `scope`:

```javascript
evaluate = expressions.compile("name");
scope = { name: "Jenny" };
evaluate(scope); // returns 'Jenny'

evaluate = expressions.compile("ship.pirate.name = 'Störtebeker'");
evaluate(scope); // won't throw an error because angular's expressions are forgiving
console.log(scope.ship.pirate.name); // prints 'Störtebeker'
```

For assigning values, you can also use `.assign()`:

```javascript
evaluate = expressions.compile("ship.pirate.name");
evaluate.assign(scope, "Störtebeker");
console.log(scope.ship.pirate.name); // prints 'Störtebeker'
```

Check out [their readme](http://docs.angularjs.org/guide/expression) for further information.

<br />

## Setup

[![npm status](https://nodei.co/npm/angular-expressions.svg?downloads=true&stars=true&downloadRank=true)](https://npmjs.org/package/angular-expressions)

<br />

## Filters

Angular provides a mechanism to define filters on expressions:

```javascript
expressions.filters.uppercase = (input) => input.toUpperCase();

expr = expressions.compile("'arr' | uppercase");
expr(); // returns 'ARR'
```

Arguments are evaluated against the scope:

```javascript
expressions.filters.currency = (input, currency, digits) => {
  input = input.toFixed(digits);

  if (currency === "EUR") {
    return input + "€";
  } else {
    return input + "$";
  }
};

expr = expressions.compile("1.2345 | currency:selectedCurrency:2");
expr({
  selectedCurrency: "EUR",
}); // returns '1.23€'
```

If you need an isolated `filters` object, this can be achieved by setting the `filters` attribute in the `options` argument. Global cache is disabled if using `options.filters`. To setup an isolated cache, you can also set the `cache` attribute in the `options` argument:

```javascript
var isolatedFilters = {
  transform: (input) => input.toLowerCase(),
};
var isolatedCache = {};

var resultOne = expressions.compile("'Foo Bar' | transform", {
  filters: isolatedFilters,
  cache: isolatedCache,
});

console.log(resultOne()); // prints 'foo bar'
console.log(isolatedCache); // prints '{"'Foo Bar' | transform": [Function fn] }'
```

<br />

## API

### exports

#### .compile(src): Function

Compiles `src` and returns a function `evaluate()`. The compiled function is cached under `compile.cache[src]` to speed up further calls.

Compiles also export the AST.

Example output of: `compile("tmp + 1").ast`

```
{ type: 'Program',
  body:
   [ { type: 'ExpressionStatement',
       expression:
        { type: 'Identifier',
          name: 'tmp',
          constant: false,
          toWatch: [ [Circular] ] } } ],
  constant: false }
```

_NOTE_ angular \$parse do not export ast variable it's done by this library.

#### .compile.cache = Object.create(null)

A cache containing all compiled functions. The src is used as key. Set this on `false` to disable the cache.

#### .filters = {}

An empty object where you may define your custom filters.

#### .Lexer

The internal [Lexer](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js#L116).

#### .Parser

The internal [Parser](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js#L390).

---

### evaluate(scope?): \*

Evaluates the compiled `src` and returns the result of the expression. Property look-ups or assignments are executed on a given `scope`.

### evaluate.assign(scope, value): \*

Tries to assign the given `value` to the result of the compiled expression on the given `scope` and returns the result of the assignment.

<br />

## In the browser

There is no `dist` build because it's not 2005 anymore. Use a module bundler like [webpack](http://webpack.github.io/) or [browserify](http://browserify.org/). They're both capable of CommonJS and AMD.

<br />

# Security

## Security recommendation

If you are running in Node.JS, we recommend you to use the following flag in your node command so that access to `__proto__` is not possible.

This puts an additional security layer which makes vulnerabilities much less
likely to affect you.

The flag can be set like this :

```bash
node --disable-proto=delete app.js
```

If you're using some libraries that still rely on Prototype, this could break your application.

## User Precaution

When providing data or filters to the library, ensure that you do not include "eval", "Function", or any filters that internally invoke these functions, as doing so could expose your users to the risk of Remote Code Execution (RCE).

## Authorship

Kudos go entirely to the great angular.js team, it's their implementation!

<br />

## Contributing

Suggestions and bug-fixes are always appreciated. Don't hesitate to create an issue or pull-request. All contributed code should pass

1. the tests in node.js by running `npm test`
2. the tests in all major browsers by running `npm run test-browser` and then visiting `http://localhost:8080/bundle`

<br />

## License

[Unlicense](http://unlicense.org/)

## Sponsors

[<img src="https://assets.peerigon.com/peerigon/logo/peerigon-logo-flat-spinat.png" width="150" />](https://peerigon.com)
