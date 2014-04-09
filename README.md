angular-expressions
===================

[angular's expressions](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js) extracted as a standalone module for the browser and node. Check out [their readme](http://docs.angularjs.org/guide/expression) for further information.

<br />

Setup
-----

[![npm status](https://nodei.co/npm/angular-expressions.png?downloads=true&stars=true)](https://npmjs.org/package/angular-expressions)

[![build status](https://travis-ci.org/peerigon/angular-expressions.png)](http://travis-ci.org/peerigon/angular-expressions)

[![browser support](https://ci.testling.com/peerigon/angular-expressions.png)
](https://ci.testling.com/peerigon/angular-expressions)

<br />

Usage
-----

```javascript
var expressions = require("angular-expressions"),
    scope,
    expr;

expr = expressions.compile("1 + 1");
expr(); // returns 2

expr = expressions.compile("name");
scope = { name: 'Jenny' };
expr(scope); // returns 'Jenny'

expr = expressions.compile("ship.pirate.name = 'Störtebeker'");
scope = {};
expr(scope); // won't throw an error because angular's expressions are forgiving

console.log(scope.ship.pirate.name); // prints 'Störtebeker'
```

<br />

Filters
-------------

Angular provides a mechanism to define filters on expressions:

```javascript
expressions.filters.uppercase = function (input) {
    return input.toUpperCase();
};

expr = expressions.compile("'arr' | uppercase");
expr(); // returns 'ARR'
```

Arguments are evaluated against the scope:

```javascript
expressions.filters.currency = function (input, currency, digits) {
    input = input.toFixed(digits);

    if (currency === "EUR") {
        return input + "€";
    } else {
        return input + "$";
    }
};

expr = expressions.compile("1.2345 | currency:selectedCurrency:2");
expr({
    selectedCurrency: "EUR"
}); // returns '1.23€'
```

<br />

API
---

### .compile(src: String): Function&lt;target?&gt;
Compiles `src` and returns a function that executes `src` on a `target` object. The compiled function is cached under `compile.cache[src]` to speed up further calls.

### .compile.cache: Object|Boolean

A cache containing all compiled functions. The src is used as key. Set this on `false` to disable the cache.

### .filters: Object

An empty object where you may define your custom filters.

### .Lexer: Lexer

The internal [Lexer](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js#L116).

### .Parser: Parser

The internal [Parser](https://github.com/angular/angular.js/blob/6b049c74ccc9ee19688bb9bbe504c300e61776dc/src/ng/parse.js#L390).


<br />

In the browser
-------------

There is no `dist` build because it's not 2005 anymore. Use a module bundler like [webpack](http://webpack.github.io/) or [browserify](http://browserify.org/). They're both capable of CommonJS and AMD.

<br />

Security
--------

Comment from `angular.js/src/ng/parse.js`:

---

Angular expressions are generally considered safe because these expressions only have direct
access to $scope and locals. However, one can obtain the ability to execute arbitrary JS code by
obtaining a reference to native JS functions such as the Function constructor.

As an example, consider the following Angular expression:

```javascript
{}.toString.constructor(alert("evil JS code"))
```

We want to prevent this type of access. For the sake of performance, during the lexing phase we
disallow any "dotted" access to any member named "constructor".

For reflective calls (a[b]) we check that the value of the lookup is not the Function constructor
while evaluating the expression, which is a stronger but more expensive test. Since reflective
calls are expensive anyway, this is not such a big deal compared to static dereferencing.
This sandboxing technique is not perfect and doesn't aim to be. The goal is to prevent exploits
against the expression language, but not to prevent exploits that were enabled by exposing
sensitive JavaScript or browser apis on Scope. Exposing such objects on a Scope is never a good
practice and therefore we are not even trying to protect against interaction with an object
explicitly exposed in this way.

A developer could foil the name check by aliasing the Function constructor under a different
name on the scope.

In general, it is not possible to access a Window object from an angular expression unless a
window or some DOM object that has a reference to window is published onto a Scope.

---

<br />

Authorship
----------
Kudos go entirely to the great angular.js team, it's their implementation!


<br />

Contributing
------------

Suggestions and bug-fixes are always appreciated. Don't hesitate to create an issue or pull-request. All contributed code should pass

1. the tests in node.js by running `npm test`
2. the tests in all major browsers by running `npm run test-browser` and then visiting `http://localhost:8080/bundle`

<br />

License
-------

[Unlicense](http://unlicense.org/)