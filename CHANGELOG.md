### 1.1.9

Update typescript typings (add `.assign` method)

### 1.1.8

Update typescript typings (add filters).

### 1.1.7

Add typescript typings (for compile, Parser and Lexer).

### 1.1.6

Published by mistake (same as 1.1.7), but without dependency changes

### 1.1.5

Add specific error when a filter is not defined.

### 1.1.4

Bugfix : When using an assignment expression, such as `b = a`, the value will always be set in the scope, not in the locals.

With this code :

```js
const scope = { a: 10 };
const locals = { b: 5 };
compile("b=a")(scope, locals);
```

The scope value will be `{ a: 10, b: 10 }` after the evaluation.

In previous versions, the value would be assigned to the locals, meaning locals would be `{ b: 10 }`

### 1.1.3

Bugfix : Make module ES5 compatible (to work in IE10 for example), by using var instead of const

### 1.1.2

- Disallow access to prototype chain (CVE-2021-21277)

### 1.1.1

Previous version was published with ES6 feature, now the published JS uses ES5 only

### 1.1.0

- Add support for special characters by using the following :

```javascript
function validChars(ch) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_" ||
    ch === "$" ||
    "ÀÈÌÒÙàèìòùÁÉÍÓÚáéíóúÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüÿß".indexOf(ch) !== -1
  );
}
evaluate = compile("être_embarassé", {
  isIdentifierStart: validChars,
  isIdentifierContinue: validChars,
});

evaluate({ être_embarassé: "Ping" });
```

### 1.0.1

- Disallow access to prototype chain (CVE-2020-5219)

### 1.0.0

- Add support for `this` keyword to write :

```javascript
evaluate = compile("this + 2")(2); // which gives 4
```
