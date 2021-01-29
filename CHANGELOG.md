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
