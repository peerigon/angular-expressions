"use strict";

/* eslint-disable complexity, eqeqeq, func-style */

var alwaysDeniedIdentifiers = [
	" ",
	"&",
	"'",
	"(",
	")",
	"*",
	"+",
	",",
	"-",
	".",
	"`",
	"\n",
	"\r",
	"\\",
	"\u2028",
	"\u2029",
	"/",
	":",
	";",
	"<",
	"=",
	"?",
	"[",
	"]",
	"{",
	"|",
	"}",
	'"',
];

var MAX_STRING_LENGTH = 5242880; // 5Mb: 5 * 1024 * 1024 = 5242880
var window = { document: {} };

var nativeHasOwn = Object.prototype.hasOwnProperty;
var nativeCall = Function.prototype.call;
var nativeApply = Function.prototype.apply;
// This creates a function that effectively does:
// nativeCall.call(nativeHasOwn, obj, key)
var hasOwn = nativeCall.bind(nativeCall, nativeHasOwn);
var $call = Function.prototype.call.bind(Function.prototype.call);
var $apply = nativeCall.bind(nativeCall, nativeApply);

var lowercase = function (string) {
	return isString(string) ? string.toLowerCase() : string;
};

/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = Array.isArray;

var manualLowercase = function (s) {
	return isString(s)
		? s.replace(/[A-Z]/g, function (ch) {
				return String.fromCharCode(ch.charCodeAt(0) | 32);
			})
		: s;
};

// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives. See https://github.com/angular/angular.js/issues/11387
if ("I".toLowerCase() !== "i") {
	lowercase = manualLowercase;
}

// Run a function and disallow temporarly the use of the Function constructor
// This makes arbitrary code generation attacks way more complicated.
function runWithFunctionConstructorProtection(fn) {
	var originalFunctionConstructor = Function.prototype.constructor;
	if (originalFunctionConstructor) {
		delete Function.prototype.constructor;
	}
	var result = fn();

	if (originalFunctionConstructor) {
		// eslint-disable-next-line no-extend-native
		Function.prototype.constructor = originalFunctionConstructor;
	}
	return result;
}

var jqLite, // delay binding since jQuery could be loaded after us.
	toString = Object.prototype.toString,
	getPrototypeOf = Object.getPrototypeOf,
	ngMinErr = minErr("ng");

/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
	// `null`, `undefined` and `window` are not array-like
	if (obj == null || isWindow(obj)) {
		return false;
	}

	// arrays, strings and jQuery/jqLite objects are array like
	// * jqLite is either the jQuery or jqLite constructor function
	// * we have to check the existence of jqLite first as this method is called
	//   via the forEach method when constructing the jqLite object in the first place
	if (isArray(obj) || isString(obj) || (jqLite && obj instanceof jqLite)) {
		return true;
	}

	// Support: iOS 8.2 (not reproducible in simulator)
	// "length" in obj used to prevent JIT error (gh-11508)
	var length = "length" in Object(obj) && obj.length;

	// NodeList objects (with `item` method) and
	// other objects with suitable length characteristics are array-like
	return (
		isNumber(length) &&
		((length >= 0 && (length - 1 in obj || obj instanceof Array)) ||
			typeof obj.item === "function")
	);
}

/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited
 * properties because it filters using the `hasOwnProperty` method.
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

function forEach(obj, iterator) {
	var key, length;
	if (obj) {
		if (isArray(obj) || isArrayLike(obj)) {
			for (key = 0, length = obj.length; key < length; key++) {
				if (key in obj) {
					$call(iterator, Object.create(null), obj[key], key, obj);
				}
			}
		} else {
			for (key in obj) {
				if (hasOwn(obj, key)) {
					$call(iterator, Object.create(null), obj[key], key, obj);
				}
			}
		}
	}
	return obj;
}

/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj, h) {
	if (h) {
		obj.$$hashKey = h;
	} else {
		delete obj.$$hashKey;
	}
}

function noop() {}

/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value) {
	return typeof value === "undefined";
}

/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value) {
	return typeof value !== "undefined";
}

/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value) {
	// http://jsperf.com/isobject4
	return value !== null && typeof value === "object";
}

/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value) {
	return typeof value === "string";
}

/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
 *
 * If you wish to exclude these then you can use the native
 * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
 * method.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value) {
	return typeof value === "number";
}

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value) {
	return typeof value === "function";
}

/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
	return obj && obj.window === obj;
}

function isScope(obj) {
	return obj && obj.$evalAsync && obj.$watch;
}

var TYPED_ARRAY_REGEXP =
	/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;
function isTypedArray(value) {
	return (
		value &&
		isNumber(value.length) &&
		TYPED_ARRAY_REGEXP.test($call(toString, value))
	);
}

function isArrayBuffer(obj) {
	return $call(toString, obj) === "[object ArrayBuffer]";
}
/**
 * @ngdoc function
 * @name angular.copy
 * @module ng
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to `destination` an exception will be thrown.
 *
 * <br />
 * <div class="alert alert-warning">
 *   Only enumerable properties are taken into account. Non-enumerable properties (both on `source`
 *   and on `destination`) will be ignored.
 * </div>
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
  <example module="copyExample" name="angular-copy">
    <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate class="simple-form">
          <label>Name: <input type="text" ng-model="user.name" /></label><br />
          <label>Age:  <input type="number" ng-model="user.age" /></label><br />
          Gender: <label><input type="radio" ng-model="user.gender" value="male" />male</label>
                  <label><input type="radio" ng-model="user.gender" value="female" />female</label><br />
          <button ng-click="reset()">RESET</button>
          <button ng-click="update(user)">SAVE</button>
        </form>
        <pre>form = {{user | json}}</pre>
        <pre>master = {{master | json}}</pre>
      </div>
    </file>
    <file name="script.js">
      // Module: copyExample
      angular.
        module('copyExample', []).
        controller('ExampleController', ['$scope', function($scope) {
          $scope.master = {};

          $scope.reset = function() {
            // Example with 1 argument
            $scope.user = angular.copy($scope.master);
          };

          $scope.update = function(user) {
            // Example with 2 arguments
            angular.copy(user, $scope.master);
          };

          $scope.reset();
        }]);
    </file>
  </example>
 */
function copy(source, destination) {
	var stackSource = [];
	var stackDest = [];

	if (destination) {
		if (isTypedArray(destination) || isArrayBuffer(destination)) {
			throw ngMinErr(
				"cpta",
				"Can't copy! TypedArray destination cannot be mutated."
			);
		}
		if (source === destination) {
			throw ngMinErr(
				"cpi",
				"Can't copy! Source and destination are identical."
			);
		}

		// Empty the destination object
		if (isArray(destination)) {
			destination.length = 0;
		} else {
			forEach(destination, function (value, key) {
				if (key !== "$$hashKey") {
					delete destination[key];
				}
			});
		}

		stackSource.push(source);
		stackDest.push(destination);
		return copyRecurse(source, destination);
	}

	return copyElement(source);

	function copyRecurse(source, destination) {
		var h = destination.$$hashKey;
		var key;
		if (isArray(source)) {
			for (var i = 0, ii = source.length; i < ii; i++) {
				destination.push(copyElement(source[i]));
			}
		} else {
			for (key in source) {
				if (hasOwn(source, key)) {
					destination[key] = copyElement(source[key]);
				}
			}
		}
		setHashKey(destination, h);
		return destination;
	}

	function copyElement(source) {
		// Simple values
		if (!isObject(source)) {
			return source;
		}

		// Already copied values
		var index = stackSource.indexOf(source);
		if (index !== -1) {
			return stackDest[index];
		}

		if (isWindow(source) || isScope(source)) {
			throw ngMinErr(
				"cpws",
				"Can't copy! Making copies of Window or Scope instances is not supported."
			);
		}

		var needsRecurse = false;
		var destination = copyType(source);

		if (destination === undefined) {
			destination = isArray(source)
				? []
				: Object.create(getPrototypeOf(source));
			needsRecurse = true;
		}

		stackSource.push(source);
		stackDest.push(destination);

		return needsRecurse ? copyRecurse(source, destination) : destination;
	}

	function copyType(source) {
		switch ($call(toString, source)) {
			case "[object Int8Array]":
			case "[object Int16Array]":
			case "[object Int32Array]":
			case "[object Float32Array]":
			case "[object Float64Array]":
			case "[object Uint8Array]":
			case "[object Uint8ClampedArray]":
			case "[object Uint16Array]":
			case "[object Uint32Array]":
				return new source.constructor(
					copyElement(source.buffer),
					source.byteOffset,
					source.length
				);

			case "[object ArrayBuffer]":
				// Support: IE10
				if (!source.slice) {
					// If we're in this case we know the environment supports ArrayBuffer

					var copied = new ArrayBuffer(source.byteLength);
					new Uint8Array(copied).set(new Uint8Array(source));

					return copied;
				}
				return source.slice(0);

			case "[object Boolean]":
			case "[object Number]":
			case "[object String]":
			case "[object Date]":
				return new source.constructor(source.valueOf());

			case "[object RegExp]":
				var re = new RegExp(
					source.source,
					source.toString().match(/[^\/]*$/)[0]
				);
				re.lastIndex = source.lastIndex;
				return re;

			case "[object Blob]":
				return new source.constructor([source], { type: source.type });
		}

		if (isFunction(source.cloneNode)) {
			return source.cloneNode(true);
		}
	}
}

/**
 * @ngdoc function
 * @name angular.bind
 * @module ng
 * @kind function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for
 * `fn`). You can supply optional `args` that are prebound to the function. This feature is also
 * known as [partial application](http://en.wikipedia.org/wiki/Partial_application), as
 * distinguished from [function currying](http://en.wikipedia.org/wiki/Currying#Contrast_with_partial_function_application).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */

function toJsonReplacer(key, value) {
	var val = value;

	if (
		typeof key === "string" &&
		key.charAt(0) === "$" &&
		key.charAt(1) === "$"
	) {
		val = undefined;
	} else if (isWindow(value)) {
		val = "$WINDOW";
	} else if (value && window.document === value) {
		val = "$DOCUMENT";
	} else if (isScope(value)) {
		val = "$SCOPE";
	}

	return val;
}

/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
	return Object.create(null);
}

function serializeObject(obj) {
	var seen = [];

	return JSON.stringify(obj, function (key, val) {
		val = toJsonReplacer(key, val);
		if (isObject(val)) {
			if (seen.indexOf(val) >= 0) {
				return "...";
			}

			seen.push(val);
		}
		return val;
	});
}

function toDebugString(obj) {
	if (typeof obj === "function") {
		return obj.toString().replace(/ \{[\s\S]*$/, "");
	} else if (isUndefined(obj)) {
		return "undefined";
	} else if (typeof obj !== "string") {
		return serializeObject(obj);
	}
	return obj;
}

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

function minErr(module, ErrorConstructor) {
	ErrorConstructor = ErrorConstructor || Error;
	return function () {
		var SKIP_INDEXES = 2;

		var templateArgs = arguments,
			code = templateArgs[0],
			message = "[" + (module ? module + ":" : "") + code + "] ",
			template = templateArgs[1],
			paramPrefix,
			i;

		message += template.replace(/\{\d+\}/g, function (match) {
			var index = +match.slice(1, -1),
				shiftedIndex = index + SKIP_INDEXES;

			if (shiftedIndex < templateArgs.length) {
				return toDebugString(templateArgs[shiftedIndex]);
			}

			return match;
		});

		message +=
			'\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/' +
			(module ? module + "/" : "") +
			code;

		for (
			i = SKIP_INDEXES, paramPrefix = "?";
			i < templateArgs.length;
			i++, paramPrefix = "&"
		) {
			message +=
				paramPrefix +
				"p" +
				(i - SKIP_INDEXES) +
				"=" +
				encodeURIComponent(toDebugString(templateArgs[i]));
		}

		return new ErrorConstructor(message);
	};
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var $parseMinErr = minErr("$parse");

// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are no longer sandboxed. So it is now even easier to access arbitrary JS code by
// various means such as obtaining a reference to native JS functions like the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor('alert("evil JS code")')
//
// It is important to realize that if you create an expression from a string that contains user provided
// content then it is possible that your application contains a security vulnerability to an XSS style attack.
//
// See https://docs.angularjs.org/guide/security

function getStringValue(name) {
	// Property names must be strings. This means that non-string objects cannot be used
	// as keys in an object. Any non-string object, including a number, is typecasted
	// into a string via the toString method.
	// -- MDN, https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Property_accessors#Property_names
	//
	// So, to ensure that we are checking the same `name` that JavaScript would use, we cast it
	// to a string. It's not always possible. If `name` is an object and its `toString` method is
	// 'broken' (doesn't return a string, isn't a function, etc.), an error will be thrown:
	//
	// TypeError: Cannot convert object to primitive value
	//
	// For performance reasons, we don't catch this error here and allow it to propagate up the call
	// stack. Note that you'll get the same error in JavaScript if you try to access a property using
	// such a 'broken' object as a key.
	return name + "";
}

var OPERATORS = createMap();
forEach(
	"+ - * / % === !== == != < > <= >= && || ?? ! = | ?".split(" "),
	function (operator) {
		OPERATORS[operator] = true;
	}
);
var ESCAPE = {
	n: "\n",
	f: "\f",
	r: "\r",
	t: "\t",
	v: "\v",
	"'": "'",
	'"': '"',
};

/////////////////////////////////////////

/**
 * @constructor
 */
function Lexer(options) {
	this.options = options || {};
}

Lexer.prototype = {
	constructor: Lexer,

	lex: function (text) {
		this.text = text;
		this.index = 0;
		this.tokens = [];

		while (this.index < this.text.length) {
			var ch = this.text.charAt(this.index);
			if (ch === '"' || ch === "'" || ch === "`") {
				this.readString(ch);
			} else if (
				this.isNumber(ch) ||
				(ch === "." && this.isNumber(this.peek()))
			) {
				this.readNumber();
			} else if (this.isIdentifierStart(this.peekMultichar())) {
				this.readIdent();
			} else if (this.is(ch, "(){}[].,;:")) {
				this.tokens.push({ index: this.index, text: ch });
				this.index++;
			} else if (this.isWhitespace(ch)) {
				this.index++;
			} else {
				var ch2 = ch + this.peek();
				var ch3 = ch2 + this.peek(2);
				var op1 = OPERATORS[ch];
				var op2 = OPERATORS[ch2];
				var op3 = OPERATORS[ch3];
				if (op1 || op2 || op3) {
					var token = op3 ? ch3 : op2 ? ch2 : ch;
					this.tokens.push({ index: this.index, text: token, operator: true });
					this.index += token.length;
				} else {
					this.throwError(
						"Unexpected next character ",
						this.index,
						this.index + 1
					);
				}
			}
		}
		return this.tokens;
	},

	is: function (ch, chars) {
		return chars.indexOf(ch) !== -1;
	},

	peek: function (i) {
		var num = i || 1;
		return this.index + num < this.text.length
			? this.text.charAt(this.index + num)
			: false;
	},

	isNumber: function (ch) {
		return ch >= "0" && ch <= "9" && typeof ch === "string";
	},

	isWhitespace: function (ch) {
		// IE treats non-breaking space as \u00A0
		return (
			ch === " " ||
			ch === "\r" ||
			ch === "\t" ||
			ch === "\n" ||
			ch === "\v" ||
			ch === "\u00A0"
		);
	},

	isIdentifierStart: function (ch) {
		if (!this.options.isIdentifierStart) {
			return this.isValidIdentifierStart(ch);
		}
		if (!this.options.isIdentifierStart(ch, this.codePointAt(ch))) {
			return false;
		}
		if (alwaysDeniedIdentifiers.indexOf(ch) !== -1) {
			throw new Error(
				"Character " + ch + " should never be part of an identifier"
			);
		}
		return true;
	},

	isValidIdentifierStart: function (ch) {
		return (
			(ch >= "a" && ch <= "z") ||
			(ch >= "A" && ch <= "Z") ||
			ch === "_" ||
			ch === "$"
		);
	},

	isIdentifierContinue: function (ch) {
		if (!this.options.isIdentifierContinue) {
			return this.isValidIdentifierContinue(ch);
		}

		if (!this.options.isIdentifierContinue(ch, this.codePointAt(ch))) {
			return false;
		}
		if (alwaysDeniedIdentifiers.indexOf(ch) !== -1) {
			throw new Error(
				"Character " + ch + " should never be part of an identifier"
			);
		}
		return true;
	},

	isValidIdentifierContinue: function (ch, cp) {
		return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
	},

	codePointAt: function (ch) {
		if (ch.length === 1) {
			return ch.charCodeAt(0);
		}

		return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35fdc00;
	},

	peekMultichar: function () {
		var ch = this.text.charAt(this.index);
		var peek = this.peek();
		if (!peek) {
			return ch;
		}
		var cp1 = ch.charCodeAt(0);
		var cp2 = peek.charCodeAt(0);
		if (cp1 >= 0xd800 && cp1 <= 0xdbff && cp2 >= 0xdc00 && cp2 <= 0xdfff) {
			return ch + peek;
		}
		return ch;
	},

	isExpOperator: function (ch) {
		return ch === "-" || ch === "+" || this.isNumber(ch);
	},

	throwError: function (error, start, end) {
		end = end || this.index;
		var colStr = isDefined(start)
			? "s " +
				start +
				"-" +
				this.index +
				" [" +
				this.text.substring(start, end) +
				"]"
			: " " + end;
		throw $parseMinErr(
			"lexerr",
			"Lexer Error: {0} at column{1} in expression [{2}].",
			error,
			colStr,
			this.text
		);
	},

	readNumber: function () {
		var number = "";
		var start = this.index;
		while (this.index < this.text.length) {
			var ch = lowercase(this.text.charAt(this.index));
			if (ch === "." || this.isNumber(ch)) {
				number += ch;
			} else {
				var peekCh = this.peek();
				if (ch === "e" && this.isExpOperator(peekCh)) {
					number += ch;
				} else if (
					this.isExpOperator(ch) &&
					peekCh &&
					this.isNumber(peekCh) &&
					number.charAt(number.length - 1) === "e"
				) {
					number += ch;
				} else if (
					this.isExpOperator(ch) &&
					(!peekCh || !this.isNumber(peekCh)) &&
					number.charAt(number.length - 1) === "e"
				) {
					this.throwError("Invalid exponent");
				} else {
					break;
				}
			}
			this.index++;
		}
		this.tokens.push({
			index: start,
			text: number,
			constant: true,
			value: Number(number),
		});
	},

	readIdent: function () {
		var start = this.index;
		this.index += this.peekMultichar().length;
		while (this.index < this.text.length) {
			var ch = this.peekMultichar();
			if (!this.isIdentifierContinue(ch)) {
				break;
			}
			this.index += ch.length;
		}
		this.tokens.push({
			index: start,
			text: this.text.slice(start, this.index),
			identifier: true,
		});
	},

	readString: function (quote) {
		var start = this.index;
		this.index++;
		var string = "";
		var rawString = quote;
		var isTemplateLiteral = quote === "`";
		var escape = false;

		while (this.index < this.text.length) {
			var ch = this.text.charAt(this.index);

			if (
				isTemplateLiteral &&
				!escape &&
				ch === "$" &&
				this.text.charAt(this.index + 1) === "{"
			) {
				// Emit the string segment accumulated so far
				this.tokens.push({
					index: start,
					text: rawString,
					constant: true,
					value: string,
				});

				this.index += 2; // skip ${
				var exprStart = this.index;

				// Track brace depth to find the real closing }
				var depth = 1;
				while (this.index < this.text.length && depth > 0) {
					var c = this.text.charAt(this.index);
					if (c === "{") {
						depth++;
					} else if (c === "}") {
						depth--;
						if (depth === 0) {
							break;
						}
					}
					this.index++;
				}

				if (depth !== 0) {
					this.throwError("Unterminated template expression", exprStart);
				}

				var exprText = this.text.substring(exprStart, this.index);

				// Validate the inner expression via AST parse.
				// this.options has literals and disabledSyntaxes merged in from compile.js
				// via: var lexerOptions = Object.assign({}, options, parserOptions);
				try {
					var innerAst = new AST(new Lexer(this.options), this.options);
					innerAst.ast(exprText);
				} catch (e) {
					this.throwError(
						"Invalid expression in template literal '" +
							exprText +
							"': " +
							e.message,
						exprStart
					);
				}

				// Re-lex to emit the inner tokens into the main token stream
				var innerTokens = new Lexer(this.options).lex(exprText);

				this.tokens.push({ index: exprStart, text: "+", operator: true });
				for (var i = 0, len = innerTokens.length; i < len; i++) {
					this.tokens.push(innerTokens[i]);
				}
				this.tokens.push({ index: this.index, text: "+", operator: true });

				this.index++; // skip closing }

				// Reset for the next string segment
				string = "";
				rawString = "`";
				start = this.index;
				continue;
			}

			rawString += ch;

			if (escape) {
				if (ch === "u") {
					var hex = this.text.substring(this.index + 1, this.index + 5);
					if (!hex.match(/[\da-f]{4}/i)) {
						this.throwError("Invalid unicode escape [\\u" + hex + "]");
					}
					this.index += 4;
					string += String.fromCharCode(parseInt(hex, 16));
				} else {
					var rep = ESCAPE[ch];
					string = string + (rep || ch);
				}
				escape = false;
			} else if (ch === "\\") {
				escape = true;
			} else if (ch === quote) {
				// Closing backtick — emit final string segment and return
				this.index++;
				this.tokens.push({
					index: start,
					text: rawString,
					constant: true,
					value: string,
				});
				return;
			} else {
				string += ch;
			}

			this.index++;
		}

		this.throwError("Unterminated quote", start);
	},
};

var existingSyntaxes = [
	"Program",
	"ExpressionStatement",
	"AssignmentExpression",
	"ConditionalExpression",
	"LogicalExpression",
	"BinaryExpression",
	"UnaryExpression",
	"CallExpression",
	"MemberExpression",
	"Identifier",
	"Literal",
	"ArrayExpression",
	"Property",
	"ObjectExpression",
	"ThisExpression",
	"LocalsExpression",
	"NGValueParameter",
	"FilterExpression",
];

function AST(lexer, options) {
	this.lexer = lexer;
	this.options = options;
	if (!this.options.disabledSyntaxes) {
		this.options.disabledSyntaxes = [];
	}

	for (var i = 0, len = this.options.disabledSyntaxes.length; i < len; i++) {
		var syntax = this.options.disabledSyntaxes[i];
		if (existingSyntaxes.indexOf(syntax) === -1) {
			throw new Error(
				'Invalid syntax in disabledSyntaxes: "' +
					syntax +
					'"\n' +
					"Expected one of: [" +
					existingSyntaxes
						.map(function (s) {
							return '"' + s + '"';
						})
						.join(", ") +
					"]"
			);
		}
	}
}

AST.Program = "Program";
AST.ExpressionStatement = "ExpressionStatement";
AST.AssignmentExpression = "AssignmentExpression";
AST.ConditionalExpression = "ConditionalExpression";
AST.LogicalExpression = "LogicalExpression";
AST.BinaryExpression = "BinaryExpression";
AST.UnaryExpression = "UnaryExpression";
AST.CallExpression = "CallExpression";
AST.FilterExpression = "FilterExpression";
AST.MemberExpression = "MemberExpression";
AST.Identifier = "Identifier";
AST.Literal = "Literal";
AST.ArrayExpression = "ArrayExpression";
AST.Property = "Property";
AST.ObjectExpression = "ObjectExpression";
AST.ThisExpression = "ThisExpression";
AST.LocalsExpression = "LocalsExpression";

// Internal use only
AST.NGValueParameter = "NGValueParameter";

AST.prototype = {
	ast: function (text) {
		this.text = text;
		this.tokens = this.lexer.lex(text);

		var value = this.program();

		if (this.tokens.length !== 0) {
			this.throwError("is an unexpected token", this.tokens[0]);
		}

		return value;
	},

	program: function () {
		var body = [];
		while (true) {
			if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]")) {
				body.push(this.expressionStatement());
			}
			if (!this.expect(";")) {
				return this.guardSyntax({ type: AST.Program, body: body });
			}
		}
	},

	guardSyntax: function (suggestion) {
		var syntax = suggestion.type;
		for (var i = 0, len = this.options.disabledSyntaxes.length; i < len; i++) {
			var disabledSyntax = this.options.disabledSyntaxes[i];
			if (disabledSyntax === syntax) {
				throw new Error(
					'"' + disabledSyntax + '" is blocked by disabledSyntaxes'
				);
			}
		}
		return suggestion;
	},

	expressionStatement: function () {
		return this.guardSyntax({
			type: AST.ExpressionStatement,
			expression: this.filterChain(),
		});
	},

	filterChain: function () {
		var left = this.expression();
		while (this.expect("|")) {
			left = this.filter(left);
		}
		return left;
	},

	expression: function () {
		return this.assignment();
	},

	assignment: function () {
		var result = this.ternary();
		if (this.expect("=")) {
			if (!isAssignable(result)) {
				throw $parseMinErr("lval", "Trying to assign a value to a non l-value");
			}

			result = this.guardSyntax({
				type: AST.AssignmentExpression,
				left: result,
				right: this.assignment(),
				operator: "=",
			});
		}
		return result;
	},

	ternary: function () {
		var test = this.nullishCoalescing();
		var alternate;
		var consequent;
		if (this.expect("?")) {
			alternate = this.expression();
			if (this.consume(":")) {
				consequent = this.expression();
				return this.guardSyntax({
					type: AST.ConditionalExpression,
					test: test,
					alternate: alternate,
					consequent: consequent,
				});
			}
		}
		return test;
	},

	nullishCoalescing: function () {
		var left = this.logicalOR();
		while (this.expect("??")) {
			left = this.guardSyntax({
				type: AST.LogicalExpression,
				operator: "??",
				left: left,
				right: this.logicalOR(),
			});
		}
		return left;
	},

	logicalOR: function () {
		var left = this.logicalAND();
		while (this.expect("||")) {
			left = this.guardSyntax({
				type: AST.LogicalExpression,
				operator: "||",
				left: left,
				right: this.logicalAND(),
			});
		}
		return left;
	},

	logicalAND: function () {
		var left = this.equality();
		while (this.expect("&&")) {
			left = this.guardSyntax({
				type: AST.LogicalExpression,
				operator: "&&",
				left: left,
				right: this.equality(),
			});
		}
		return left;
	},

	equality: function () {
		var left = this.relational();
		var token;
		while ((token = this.expect("==", "!=", "===", "!=="))) {
			left = this.guardSyntax({
				type: AST.BinaryExpression,
				operator: token.text,
				left: left,
				right: this.relational(),
			});
		}
		return left;
	},

	relational: function () {
		var left = this.additive();
		var token;
		while ((token = this.expect("<", ">", "<=", ">="))) {
			left = this.guardSyntax({
				type: AST.BinaryExpression,
				operator: token.text,
				left: left,
				right: this.additive(),
			});
		}
		return left;
	},

	additive: function () {
		var left = this.multiplicative();
		var token;
		while ((token = this.expect("+", "-"))) {
			left = this.guardSyntax({
				type: AST.BinaryExpression,
				operator: token.text,
				left: left,
				right: this.multiplicative(),
			});
		}
		return left;
	},

	multiplicative: function () {
		var left = this.unary();
		var token;
		while ((token = this.expect("*", "/", "%"))) {
			left = this.guardSyntax({
				type: AST.BinaryExpression,
				operator: token.text,
				left: left,
				right: this.unary(),
			});
		}
		return left;
	},

	unary: function () {
		var token;
		if ((token = this.expect("+", "-", "!"))) {
			return this.guardSyntax({
				type: AST.UnaryExpression,
				operator: token.text,
				prefix: true,
				argument: this.unary(),
			});
		}
		return this.primary();
	},

	primary: function () {
		var primary;
		if (this.expect("(")) {
			primary = this.guardSyntax(this.filterChain());
			this.consume(")");
		} else if (this.expect("[")) {
			primary = this.guardSyntax(this.arrayDeclaration());
		} else if (this.expect("{")) {
			primary = this.guardSyntax(this.object());
		} else if (hasOwn(this.selfReferential, this.peek().text)) {
			primary = this.guardSyntax(
				copy(this.selfReferential[this.consume().text])
			);
		} else if (hasOwn(this.options.literals, this.peek().text)) {
			primary = this.guardSyntax({
				type: AST.Literal,
				value: this.options.literals[this.consume().text],
			});
		} else if (this.peek().identifier) {
			primary = this.guardSyntax(this.identifier());
		} else if (this.peek().constant) {
			primary = this.guardSyntax(this.constant());
		} else {
			this.throwError("not a primary expression", this.peek());
		}

		var next;
		while ((next = this.expect("(", "[", "."))) {
			if (next.text === "(") {
				primary = this.guardSyntax({
					type: AST.CallExpression,
					callee: primary,
					arguments: this.parseArguments(),
				});
				this.consume(")");
			} else if (next.text === "[") {
				primary = this.guardSyntax({
					type: AST.MemberExpression,
					object: primary,
					property: this.expression(),
					computed: true,
				});
				this.consume("]");
			} else if (next.text === ".") {
				primary = this.guardSyntax({
					type: AST.MemberExpression,
					object: primary,
					property: this.identifier(),
					computed: false,
				});
			} else {
				this.throwError("IMPOSSIBLE");
			}
		}

		return primary;
	},

	filter: function (baseExpression) {
		var args = [baseExpression];
		var result = this.guardSyntax({
			type: AST.FilterExpression,
			callee: this.identifier(),
			arguments: args,
			filter: true,
		});

		while (this.expect(":")) {
			args.push(this.expression());
		}

		return result;
	},

	parseArguments: function () {
		var args = [];
		if (this.peekToken().text !== ")") {
			do {
				args.push(this.filterChain());
			} while (this.expect(","));
		}
		return args;
	},

	identifier: function () {
		var token = this.consume();
		if (!token.identifier) {
			this.throwError("is not a valid identifier", token);
		}
		return this.guardSyntax({ type: AST.Identifier, name: token.text });
	},

	constant: function () {
		return this.guardSyntax({ type: AST.Literal, value: this.consume().value });
	},

	arrayDeclaration: function () {
		var elements = [];
		if (this.peekToken().text !== "]") {
			do {
				if (this.peek("]")) {
					// Support trailing commas per ES5.1.
					break;
				}
				elements.push(this.expression());
			} while (this.expect(","));
		}
		this.consume("]");

		return this.guardSyntax({ type: AST.ArrayExpression, elements: elements });
	},

	object: function () {
		var properties = [],
			property;
		if (this.peekToken().text !== "}") {
			do {
				if (this.peek("}")) {
					// Support trailing commas per ES5.1.
					break;
				}
				property = this.guardSyntax({ type: AST.Property, kind: "init" });
				if (this.peek().constant) {
					property.key = this.constant();
					property.computed = false;
					this.consume(":");
					property.value = this.expression();
				} else if (this.peek().identifier) {
					property.key = this.identifier();
					property.computed = false;
					if (this.peek(":")) {
						this.consume(":");
						property.value = this.expression();
					} else {
						property.value = property.key;
					}
				} else if (this.peek("[")) {
					this.consume("[");
					property.key = this.expression();
					this.consume("]");
					property.computed = true;
					this.consume(":");
					property.value = this.expression();
				} else {
					this.throwError("invalid key", this.peek());
				}
				properties.push(property);
			} while (this.expect(","));
		}
		this.consume("}");

		return this.guardSyntax({
			type: AST.ObjectExpression,
			properties: properties,
		});
	},

	throwError: function (msg, token) {
		throw $parseMinErr(
			"syntax",
			"Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].",
			token.text,
			msg,
			token.index + 1,
			this.text,
			this.text.substring(token.index)
		);
	},

	consume: function (e1) {
		if (this.tokens.length === 0) {
			throw $parseMinErr(
				"ueoe",
				"Unexpected end of expression: {0}",
				this.text
			);
		}

		var token = this.expect(e1);
		if (!token) {
			this.throwError("is unexpected, expecting [" + e1 + "]", this.peek());
		}
		return token;
	},

	peekToken: function () {
		if (this.tokens.length === 0) {
			throw $parseMinErr(
				"ueoe",
				"Unexpected end of expression: {0}",
				this.text
			);
		}
		return this.tokens[0];
	},

	peek: function (e1, e2, e3, e4) {
		return this.peekAhead(0, e1, e2, e3, e4);
	},

	peekAhead: function (i, e1, e2, e3, e4) {
		if (this.tokens.length > i) {
			var token = this.tokens[i];
			var t = token.text;
			if (
				t === e1 ||
				t === e2 ||
				t === e3 ||
				t === e4 ||
				(!e1 && !e2 && !e3 && !e4)
			) {
				return token;
			}
		}
		return false;
	},

	expect: function (e1, e2, e3, e4) {
		var token = this.peek(e1, e2, e3, e4);
		if (token) {
			this.tokens.shift();
			return token;
		}
		return false;
	},
};

function ifDefined(v, d) {
	return typeof v !== "undefined" ? v : d;
}

function plusFn(l, r) {
	if (
		(typeof l === "string" && l.length > MAX_STRING_LENGTH) ||
		(typeof r === "string" && r.length > MAX_STRING_LENGTH)
	) {
		throw new Error("Max string length exceeded");
	}
	if (l == null) {
		return r;
	}
	if (r == null) {
		return l;
	}
	var result = l + r;
	if (result.length > MAX_STRING_LENGTH) {
		throw new Error("Max string length exceeded");
	}
	return result;
}

function minusFn(l, r) {
	if (l == null || r == null) {
		return undefined;
	}
	return l - r;
}

function timesFn(l, r) {
	if (l == null || r == null) {
		return undefined;
	}
	return l * r;
}

function divideFn(l, r) {
	if (l == null || r == null) {
		return undefined;
	}
	return l / r;
}

function moduloFn(l, r) {
	if (l == null || r == null) {
		return undefined;
	}
	return l % r;
}

function findUndefinedFilters(ast, $filter) {
	switch (ast.type) {
		case AST.Program:
			forEach(ast.body, function (expr) {
				findUndefinedFilters(expr.expression, $filter);
			});
			break;
		case AST.UnaryExpression:
			findUndefinedFilters(ast.argument, $filter);
			break;
		case AST.AssignmentExpression:
		case AST.BinaryExpression:
		case AST.LogicalExpression:
			findUndefinedFilters(ast.left, $filter);
			findUndefinedFilters(ast.right, $filter);
			break;
		case AST.ConditionalExpression:
			findUndefinedFilters(ast.test, $filter);
			findUndefinedFilters(ast.alternate, $filter);
			findUndefinedFilters(ast.consequent, $filter);
			break;
		case AST.MemberExpression:
			findUndefinedFilters(ast.object, $filter);
			if (ast.computed) {
				findUndefinedFilters(ast.property, $filter);
			}
			break;
		case AST.FilterExpression:
		case AST.CallExpression:
			if (ast.type === AST.FilterExpression) {
				var fn = $filter(ast.callee.name);
				if (!fn) {
					throw new Error("Filter '" + ast.callee.name + "' is not defined");
				}
			}
			forEach(ast.arguments, function (expr) {
				findUndefinedFilters(expr, $filter);
			});
			break;
		case AST.ArrayExpression:
			forEach(ast.elements, function (expr) {
				findUndefinedFilters(expr, $filter);
			});
			break;
		case AST.ObjectExpression:
			forEach(ast.properties, function (expr) {
				findUndefinedFilters(expr.key, $filter);
				findUndefinedFilters(expr.value, $filter);
			});
			break;
		case AST.Identifier:
		case AST.Literal:
		case AST.ThisExpression:
		case AST.LocalsExpression:
			break;
	}
}

function isAssignable(ast) {
	return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
}

function assignableAST(ast, astBuilder) {
	if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
		return astBuilder.guardSyntax({
			type: AST.AssignmentExpression,
			left: ast.body[0].expression,
			right: astBuilder.guardSyntax({ type: AST.NGValueParameter }),
			operator: "=",
		});
	}
}

function ASTCompiler(astBuilder, $filter) {
	this.astBuilder = astBuilder;
	this.$filter = $filter;
}

ASTCompiler.prototype = {
	compile: function (expression) {
		var self = this;
		var ast = this.astBuilder.ast(expression);
		this.state = {
			nextId: 0,
			filters: Object.create(null),
			fn: { vars: [], body: [], own: {} },
			assign: { vars: [], body: [], own: {} },
			inputs: [],
		};
		findUndefinedFilters(ast, self.$filter);
		var extra = "";
		var assignable;
		this.stage = "assign";
		if ((assignable = assignableAST(ast, this.astBuilder))) {
			this.state.computing = "assign";
			var result = this.nextId();
			this.recurse(assignable, result);
			this.return_(result);
			extra = "fn.assign=" + this.generateFunction("assign", "s,v,l");
		}
		self.stage = "inputs";
		this.state.computing = "fn";
		this.stage = "main";
		this.recurse(ast);
		var fnString =
			// The build and minification steps remove the string "use strict" from the code, but this is done using a regex.
			// This is a workaround for this until we do a better job at only removing the prefix only when we should.
			'"' +
			this.USE +
			" " +
			this.STRICT +
			'";\n' +
			"var fn=" +
			this.generateFunction("fn", "s,l") +
			extra +
			this.watchFns() +
			"return fn;";

		if (global.storeFnString) {
			global.storeFnString(fnString);
		}

		// eslint-disable-next-line no-new-func
		var wrappedFn = new Function(
			"$filter",
			"$call",
			"getStringValue",
			"ifDefined",
			"plus",
			"minus",
			"times",
			"divide",
			"modulo",
			"hasOwn",
			"assertSafeValue",
			fnString
		)(
			function () {
				var args = new Array(arguments.length);
				for (var i = 0, len = arguments.length; i < len; i++) {
					args[i] = arguments[i];
				}

				return $apply(self.$filter, Object.create(null), args);
			},
			$call,
			getStringValue,
			ifDefined,
			plusFn,
			minusFn,
			timesFn,
			divideFn,
			moduloFn,
			hasOwn,
			assertSafeValue
		);

		var fn = function (s, l) {
			return runWithFunctionConstructorProtection(function () {
				return wrappedFn(s, l);
			});
		};
		fn.assign = function (s, v, l) {
			return runWithFunctionConstructorProtection(function () {
				return wrappedFn.assign(s, v, l);
			});
		};

		this.state = this.stage = undefined;
		fn.ast = ast;
		return fn;
	},

	USE: "use",

	STRICT: "strict",

	watchFns: function () {
		var result = [];
		var fns = this.state.inputs;
		var self = this;
		forEach(fns, function (name) {
			result.push("var " + name + "=" + self.generateFunction(name, "s"));
		});
		if (fns.length) {
			result.push("fn.inputs=[" + fns.join(",") + "];");
		}
		return result.join("");
	},

	generateFunction: function (name, params) {
		return (
			"function(" +
			params +
			"){" +
			this.filterPrefix() +
			this.varsPrefix(name) +
			this.body(name) +
			"};"
		);
	},

	filterPrefix: function () {
		var parts = [];
		var self = this;
		forEach(this.state.filters, function (id, filter) {
			parts.push(id + "=$filter(" + self.escape(filter) + ")");
		});
		if (parts.length) {
			return "var " + parts.join(",") + ";";
		}
		return "";
	},

	varsPrefix: function (section) {
		return this.state[section].vars.length
			? "var " + this.state[section].vars.join(",") + ";"
			: "";
	},

	body: function (section) {
		return this.state[section].body.join("");
	},

	recurse: function (ast, intoId, nameId, recursionFn, create) {
		var left,
			right,
			self = this,
			args,
			expression,
			computed;
		recursionFn = recursionFn || noop;
		this.astBuilder.guardSyntax(ast);

		switch (ast.type) {
			case AST.Program:
				forEach(ast.body, function (expression, pos) {
					self.recurse(
						expression.expression,
						undefined,
						undefined,
						function (expr) {
							right = expr;
						}
					);
					if (pos !== ast.body.length - 1) {
						self.current().body.push(right, ";");
					} else {
						self.return_(right);
					}
				});
				break;
			case AST.Literal:
				expression = this.escape(ast.value);
				this.assign(intoId, expression);
				recursionFn(intoId || expression);
				break;
			case AST.UnaryExpression:
				this.recurse(ast.argument, undefined, undefined, function (expr) {
					right = expr;
				});
				expression = ast.operator + "(" + this.ifDefined(right, 0) + ")";
				this.assign(intoId, expression);
				recursionFn(expression);
				break;
			case AST.BinaryExpression:
				this.recurse(ast.left, undefined, undefined, function (expr) {
					left = expr;
				});
				this.recurse(ast.right, undefined, undefined, function (expr) {
					right = expr;
				});
				if (ast.operator === "+") {
					expression = "plus(" + left + "," + right + ")";
				} else if (ast.operator === "-") {
					expression = "minus(" + left + "," + right + ")";
				} else if (ast.operator === "*") {
					expression = "times(" + left + "," + right + ")";
				} else if (ast.operator === "/") {
					expression = "divide(" + left + "," + right + ")";
				} else if (ast.operator === "%") {
					expression = "modulo(" + left + "," + right + ")";
				} else {
					// throw new Error("ast op" + ast.operator);
					expression = "(" + left + ")" + ast.operator + "(" + right + ")";
				}
				this.assign(intoId, expression);
				recursionFn(expression);
				break;
			case AST.LogicalExpression:
				intoId = intoId || this.nextId();
				self.recurse(ast.left, intoId);
				if (ast.operator === "??") {
					self.if_(
						self.or_(
							self.isNull(intoId),
							"typeof " + intoId + " === 'undefined'"
						),
						self.lazyRecurse(ast.right, intoId)
					);
				} else {
					self.if_(
						ast.operator === "&&" ? intoId : self.not(intoId),
						self.lazyRecurse(ast.right, intoId)
					);
				}
				recursionFn(intoId);
				break;
			case AST.ConditionalExpression:
				intoId = intoId || this.nextId();
				self.recurse(ast.test, intoId);
				self.if_(
					intoId,
					self.lazyRecurse(ast.alternate, intoId),
					self.lazyRecurse(ast.consequent, intoId)
				);
				recursionFn(intoId);
				break;
			case AST.Identifier:
				intoId = intoId || this.nextId();
				var inAssignment = self.current().inAssignment;
				if (nameId) {
					if (inAssignment) {
						nameId.context = this.assign(this.nextId(), "s");
					} else {
						nameId.context =
							self.stage === "inputs"
								? "s"
								: this.assign(
										this.nextId(),
										this.getHasOwnProperty("l", ast.name) + "?l:s"
									);
					}
					nameId.computed = false;
					nameId.name = ast.name;
				}
				self.if_(
					self.stage === "inputs" ||
						self.not(self.getHasOwnProperty("l", ast.name)),
					function () {
						self.if_(self.stage === "inputs" || "s", function () {
							var tmpId = self.nextId();
							self.assign(tmpId, self.nonComputedMember("s", ast.name));
							self.if_(
								self.or_(
									self.isNull(tmpId),
									self.hasOwnProperty_("s", ast.name, false)
								),
								function () {
									if (create && create !== 1) {
										self.if_(
											self.isNull(tmpId),
											self.lazyAssign(
												self.nonComputedMember("s", ast.name),
												"{}"
											)
										);
										self.assign(intoId, self.nonComputedMember("s", ast.name));
									} else {
										self.assign(intoId, tmpId);
									}
								}
							);
						});
					},
					intoId &&
						function () {
							self.if_(
								self.hasOwnProperty_("l", ast.name, false),
								self.lazyAssign(intoId, self.nonComputedMember("l", ast.name))
							);
						}
				);
				recursionFn(intoId);
				break;
			case AST.MemberExpression:
				left = (nameId && (nameId.context = this.nextId())) || this.nextId();
				intoId = intoId || this.nextId();
				self.recurse(
					ast.object,
					left,
					undefined,
					function () {
						var member = null;
						var inAssignment = self.current().inAssignment;
						if (ast.computed) {
							right = self.nextId();
							if (inAssignment || self.state.computing === "assign") {
								member = self.unsafeComputedMember(left, right);
							} else {
								member = self.computedMember(left, right);
							}
						} else {
							if (inAssignment || self.state.computing === "assign") {
								member = self.unsafeNonComputedMember(left, ast.property.name);
							} else {
								member = self.nonComputedMember(left, ast.property.name);
							}
							right = ast.property.name;
						}
						if (right === "__proto__") {
							// throw new Error("__proto__ is not allowed");
							return;
						}

						if (ast.computed) {
							self.recurse(ast.property, right);
						}
						self.current().body.push("assertSafeValue(" + left + ");");
						self.if_(
							self.and_(
								self.notNull(left),
								self.or_(
									self.isNull(member),
									self.hasOwnProperty_(left, right, ast.computed)
								)
							),
							function () {
								if (ast.computed) {
									if (create && create !== 1) {
										self.if_(self.not(member), self.lazyAssign(member, "{}"));
									}
									self.assign(intoId, member);
									if (nameId) {
										nameId.computed = true;
										nameId.name = right;
									}
								} else {
									if (create && create !== 1) {
										self.if_(
											self.isNull(member),
											self.lazyAssign(member, "{}")
										);
									}
									self.assign(intoId, member);
									if (nameId) {
										nameId.computed = false;
										nameId.name = ast.property.name;
									}
								}
							},
							function () {
								self.assign(intoId, "undefined");
							}
						);
						recursionFn(intoId);
					},
					!!create
				);
				break;
			case AST.FilterExpression:
			case AST.CallExpression:
				intoId = intoId || this.nextId();
				if (ast.filter) {
					right = self.filter(ast.callee.name);
					args = [];
					forEach(ast.arguments, function (expr) {
						var argument = self.nextId();
						self.recurse(expr, argument);
						args.push(argument);
					});
					expression =
						"$call(" + right + "," + right + "," + args.join(",") + ")";
					self.assign(intoId, expression);
					self.current().body.push("assertSafeValue(" + intoId + ");");
					recursionFn(intoId);
				} else {
					right = self.nextId();
					left = {};
					args = [];
					self.recurse(ast.callee, right, left, function () {
						self.if_(
							self.notNull(right),
							function () {
								forEach(ast.arguments, function (expr) {
									self.recurse(
										expr,
										ast.constant ? undefined : self.nextId(),
										undefined,
										function (argument) {
											args.push(argument);
										}
									);
								});
								if (left.name) {
									var x = self.member(left.context, left.name, left.computed);
									expression =
										"(" +
										x +
										" == null ? null :\n\t\t\t\t\t\t\t\t\t\t$call(" +
										self.unsafeMember(left.context, left.name, left.computed) +
										",\n\t\t\t\t\t\t\t\t\t\t\t" +
										[left.context].concat(args).join(",") +
										"\n\t\t\t\t\t\t\t\t\t\t\t)\n\t\t\t\t\t\t\t\t\t\t)";
								} else {
									expression = right + "(" + args.join(",") + ")";
								}
								self.assign(intoId, expression);
								self.current().body.push("assertSafeValue(" + intoId + ");");
							},
							function () {
								self.assign(intoId, "undefined");
							}
						);
						recursionFn(intoId);
					});
				}
				break;
			case AST.AssignmentExpression:
				right = this.nextId();
				intoId = intoId || this.nextId(); // <-- Force an ID to exist
				left = {};
				self.current().inAssignment = true;
				this.recurse(
					ast.left,
					undefined,
					left,
					function () {
						if (left.computed === false && left.name === "__proto__") {
							return;
						}
						self.if_(
							self.and_(
								left.computed === false
									? false
									: self.noteqeqeq_(
											"'__proto__'",
											left.computed ? left.name : "'" + left.name + "'"
										),
								self.notNull(left.context),
								self.or_(
									self.hasOwnProperty_(left.context, left.name, left.computed),
									self.isNull(
										self.member(left.context, left.name, left.computed)
									)
								)
							),
							function () {
								self.recurse(ast.right, right);
								expression =
									self.memberLeft(left.context, left.name, left.computed) +
									ast.operator +
									right;
								self.assign(intoId, expression);
								recursionFn(intoId || expression);
							},
							// ELSE Branch: Blocked / Safe fallback
							function () {
								self.assign(intoId, "undefined");
							}
						);
						self.current().inAssignment = false;
						// console.log(JSON.stringify({"ast.right": ast.right}));
						// self.recurse(ast.right, right);
						self.current().inAssignment = true;
					},
					1
				);
				// recursionFn(intoId);
				self.current().inAssignment = false;
				break;
			case AST.ArrayExpression:
				args = [];
				forEach(ast.elements, function (expr) {
					self.recurse(
						expr,
						ast.constant ? undefined : self.nextId(),
						undefined,
						function (argument) {
							args.push(argument);
						}
					);
				});
				expression = "[" + args.join(",") + "]";
				this.assign(intoId, expression);
				recursionFn(intoId || expression);
				break;
			case AST.ObjectExpression:
				args = [];
				computed = false;
				forEach(ast.properties, function (property) {
					if (property.computed) {
						computed = true;
					}
				});
				if (computed) {
					intoId = intoId || this.nextId();
					this.assign(intoId, "{}");
					forEach(ast.properties, function (property) {
						if (property.computed) {
							left = self.nextId();
							self.recurse(property.key, left);
						} else {
							left =
								property.key.type === AST.Identifier
									? property.key.name
									: "" + property.key.value;
						}
						right = self.nextId();
						self.recurse(property.value, right);
						self.assign(
							self.unsafeMember(intoId, left, property.computed),
							right
						);
					});
				} else {
					forEach(ast.properties, function (property) {
						if (property.key.name === "__proto__") {
							return;
						}
						self.recurse(
							property.value,
							ast.constant ? undefined : self.nextId(),
							undefined,
							function (expr) {
								args.push(
									self.escape(
										property.key.type === AST.Identifier
											? property.key.name
											: "" + property.key.value
									) +
										":" +
										expr
								);
							}
						);
					});
					expression = "{" + args.join(",") + "}";
					this.assign(intoId, expression);
				}
				recursionFn(intoId || expression);
				break;
			case AST.ThisExpression:
				this.assign(intoId, "s");
				self.current().body.push("assertSafeValue(" + intoId + ");");
				recursionFn(intoId || "s");
				break;
			case AST.LocalsExpression:
				this.assign(intoId, "l");
				recursionFn(intoId || "l");
				break;
			case AST.NGValueParameter:
				this.assign(intoId, "v");
				recursionFn(intoId || "v");
				break;
		}
	},

	getHasOwnProperty: function (element, property) {
		var key = element + "." + property;
		var own = this.current().own;
		if (!hasOwn(own, key)) {
			own[key] = this.nextId(
				false,
				element + "&&(" + this.escape(property) + " in " + element + ")"
			);
		}
		return own[key];
	},

	assign: function (id, value) {
		if (!id) {
			return;
		}
		this.current().body.push(id, "=", value, ";");
		return id;
	},

	filter: function (filterName) {
		if (!hasOwn(this.state.filters, filterName)) {
			this.state.filters[filterName] = this.nextId(true);
		}
		return this.state.filters[filterName];
	},

	ifDefined: function (id, defaultValue) {
		return "ifDefined(" + id + "," + this.escape(defaultValue) + ")";
	},

	plus: function (left, right) {
		return "plus(" + left + "," + right + ")";
	},

	return_: function (id) {
		this.current().body.push("return ", id, ";");
	},

	if_: function (test, alternate, consequent) {
		if (test === true) {
			alternate();
		} else {
			var body = this.current().body;
			body.push("if(", test, "){");
			alternate();
			body.push("}");
			if (consequent) {
				body.push("else{");
				consequent();
				body.push("}");
			}
		}
	},
	or_: function () {
		var args = Array.prototype.slice.call(arguments);
		return "(" + args.join(") || (") + ")";
	},
	hasOwnProperty_: function (obj, prop, computed) {
		if (computed) {
			return "(hasOwn(" + obj + "," + prop + "))";
		}
		return "(hasOwn(" + obj + ",'" + prop + "'))";
	},
	and_: function () {
		var args = Array.prototype.slice.call(arguments);
		var myArgs = [];
		for (var i = 0, len = args.length; i < len; i++) {
			var arg = args[i];
			if (arg == false) {
				continue;
			}
			myArgs.push(arg);
		}
		return "(" + myArgs.join(") && (") + ")";
	},
	not: function (expression) {
		return "!(" + expression + ")";
	},

	isNull: function (expression) {
		return expression + "==null";
	},

	notNull: function (expression) {
		return expression + "!=null";
	},

	eqeqeq_: function (a, b) {
		return "(" + a + "===" + b + ")";
	},
	noteqeqeq_: function (a, b) {
		return "(" + a + "!==" + b + ")";
	},

	nonComputedMember: function (left, right) {
		var SAFE_IDENTIFIER = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/;
		var UNSAFE_CHARACTERS = /[^$_a-zA-Z0-9]/g;
		var expr = "";
		if (SAFE_IDENTIFIER.test(right)) {
			expr = left + "." + right;
		} else {
			right = right.replace(UNSAFE_CHARACTERS, this.stringEscapeFn);
			expr = left + '["' + right + '"]';
		}

		return expr;
	},

	unsafeComputedMember: function (left, right) {
		return left + "[" + right + "]";
	},
	unsafeNonComputedMember: function (left, right) {
		return this.nonComputedMember(left, right);
	},

	computedMember: function (left, right) {
		if (this.state.computing === "assign") {
			return this.unsafeComputedMember(left, right);
		}
		return (
			"(hasOwn(" +
			left +
			"," +
			right +
			") ? " +
			left +
			"[" +
			right +
			"] : undefined)"
		);
	},

	unsafeMember: function (left, right, computed) {
		if (computed) {
			return this.unsafeComputedMember(left, right);
		}
		return this.unsafeNonComputedMember(left, right);
	},

	member: function (left, right, computed) {
		if (computed) {
			return this.computedMember(left, right);
		}
		return this.nonComputedMember(left, right);
	},

	memberLeft: function (left, right, computed) {
		if (!computed) {
			right = "'" + right + "'";
		}
		return left + "[" + right + "]";
	},

	getStringValue: function (item) {
		this.assign(item, "getStringValue(" + item + ")");
	},

	lazyRecurse: function (ast, intoId, nameId, recursionFn, create) {
		var self = this;
		return function () {
			self.recurse(ast, intoId, nameId, recursionFn, create);
		};
	},

	lazyAssign: function (id, value) {
		var self = this;
		return function () {
			self.assign(id, value);
		};
	},

	stringEscapeRegex: /[^ a-zA-Z0-9]/g,

	stringEscapeFn: function (c) {
		return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
	},

	escape: function (value) {
		if (isString(value)) {
			return (
				"'" + value.replace(this.stringEscapeRegex, this.stringEscapeFn) + "'"
			);
		}
		if (isNumber(value)) {
			return value.toString();
		}
		if (value === true) {
			return "true";
		}
		if (value === false) {
			return "false";
		}
		if (value === null) {
			return "null";
		}
		if (typeof value === "undefined") {
			return "undefined";
		}

		throw $parseMinErr("esc", "IMPOSSIBLE");
	},

	nextId: function (skip, init) {
		var id = "v" + this.state.nextId++;
		if (!skip) {
			this.current().vars.push(id + (init ? "=" + init : ""));
		}
		return id;
	},

	current: function () {
		return this.state[this.state.computing];
	},
};

function ASTInterpreter(astBuilder, $filter) {
	this.astBuilder = astBuilder;
	this.$filter = $filter;
}

function assertSafeValue(value) {
	/* eslint-disable-next-line no-eval */
	var dangerousObjects = [globalThis, eval, setTimeout, Object, Function];
	var isDangerousObject = false;

	for (var i = 0; i < dangerousObjects.length; i++) {
		if (dangerousObjects[i] === value) {
			isDangerousObject = true;
		}
	}
	if (isDangerousObject) {
		throw new Error(
			"Security Error: Direct operations on the global scope are forbidden."
		);
	}
	if (typeof value === "string" && value.length > MAX_STRING_LENGTH) {
		throw new Error("string too long");
	}
}

ASTInterpreter.prototype = {
	compile: function (expression) {
		var self = this;
		var ast = this.astBuilder.ast(expression);
		findUndefinedFilters(ast, self.$filter);
		var assignable;
		var assign;
		if ((assignable = assignableAST(ast, this.astBuilder))) {
			assign = this.recurse(assignable);
		}
		var inputs;
		var expressions = [];
		forEach(ast.body, function (expression) {
			expressions.push(self.recurse(expression.expression));
		});
		var wrappedFn =
			ast.body.length === 0
				? noop
				: ast.body.length === 1
					? expressions[0]
					: function (scope, locals) {
							var lastValue;
							forEach(expressions, function (exp) {
								lastValue = exp(scope, locals);
							});
							return lastValue;
						};

		if (assign) {
			wrappedFn.assign = function (scope, value, locals) {
				return assign(scope, locals, value);
			};
		}

		var fn = function (scope, locals) {
			return runWithFunctionConstructorProtection(function () {
				return wrappedFn(scope, locals);
			});
		};
		fn.assign = function (scope, value, locals) {
			return runWithFunctionConstructorProtection(function () {
				return wrappedFn.assign(scope, value, locals);
			});
		};

		if (inputs) {
			fn.inputs = inputs;
		}
		fn.ast = ast;
		return fn;
	},

	recurse: function (ast, context, create) {
		var left,
			right,
			self = this,
			args;
		this.astBuilder.guardSyntax(ast);
		switch (ast.type) {
			case AST.Literal:
				return this.value(ast.value, context);
			case AST.UnaryExpression:
				right = this.recurse(ast.argument);
				return this["unary" + ast.operator](right, context);
			case AST.BinaryExpression:
				left = this.recurse(ast.left);
				right = this.recurse(ast.right);
				return this["binary" + ast.operator](left, right, context);
			case AST.LogicalExpression:
				left = this.recurse(ast.left);
				right = this.recurse(ast.right);
				return this["binary" + ast.operator](left, right, context);
			case AST.ConditionalExpression:
				return this["ternary?:"](
					this.recurse(ast.test),
					this.recurse(ast.alternate),
					this.recurse(ast.consequent),
					context
				);
			case AST.Identifier:
				return self.identifier(ast.name, context, create);
			case AST.MemberExpression:
				left = this.recurse(ast.object, false, !!create);
				assertSafeValue(left);
				if (!ast.computed) {
					right = ast.property.name;
				}
				if (ast.computed) {
					right = this.recurse(ast.property);
				}

				return ast.computed
					? this.computedMember(left, right, context, create)
					: this.nonComputedMember(left, right, context, create);
			case AST.FilterExpression:
			case AST.CallExpression:
				args = [];
				forEach(ast.arguments, function (expr) {
					args.push(self.recurse(expr));
				});
				if (!ast.filter) {
					right = this.recurse(ast.callee, true);
				}
				return ast.filter
					? function (scope, locals, assign) {
							if (ast.filter) {
								right = self.$filter(ast.callee.name);
							}
							var values = [];
							for (var i = 0; i < args.length; ++i) {
								values.push(args[i](scope, locals, assign));
							}
							var value = $apply(right, right, values);
							assertSafeValue(value);
							return context
								? { context: undefined, name: undefined, value: value }
								: value;
						}
					: function (scope, locals, assign) {
							var rhs = right(scope, locals, assign);
							var value;
							if (rhs.value != null) {
								var values = [];
								for (var i = 0; i < args.length; ++i) {
									values.push(args[i](scope, locals, assign));
								}
								if (typeof rhs.value === "function") {
									value = $apply(
										rhs.value,
										rhs.context != null ? rhs.context : Object.create(null),
										values
									);
									assertSafeValue(value);
								}
							}
							return context ? { value: value } : value;
						};
			case AST.AssignmentExpression:
				left = this.recurse(ast.left, true, 1);
				right = this.recurse(ast.right);
				return function (scope, locals, assign) {
					var lhs = left(scope, false, assign);
					var rhs = right(scope, locals, assign);
					if (lhs.context) {
						if (
							hasOwn(lhs.context, lhs.name) ||
							lhs.context[lhs.name] == null
						) {
							lhs.context[lhs.name] = rhs;
						}
						return context ? { value: rhs } : rhs;
					}
					return null;
				};
			case AST.ArrayExpression:
				args = [];
				forEach(ast.elements, function (expr) {
					args.push(self.recurse(expr));
				});
				return function (scope, locals, assign) {
					var value = [];
					for (var i = 0; i < args.length; ++i) {
						value.push(args[i](scope, locals, assign));
					}
					return context ? { value: value } : value;
				};
			case AST.ObjectExpression:
				args = [];
				forEach(ast.properties, function (property) {
					if (property.computed) {
						args.push({
							key: self.recurse(property.key),
							computed: true,
							value: self.recurse(property.value),
						});
					} else {
						args.push({
							key:
								property.key.type === AST.Identifier
									? property.key.name
									: "" + property.key.value,
							computed: false,
							value: self.recurse(property.value),
						});
					}
				});
				return function (scope, locals, assign) {
					var value = {};
					for (var i = 0; i < args.length; ++i) {
						var key;
						if (args[i].computed) {
							key = args[i].key(scope, locals, assign);
						} else {
							key = args[i].key;
						}
						if (key === "__proto__") {
							continue;
						}
						value[key] = args[i].value(scope, locals, assign);
					}
					return context ? { value: value } : value;
				};
			case AST.ThisExpression:
				return function (scope) {
					assertSafeValue(scope);
					return context ? { value: scope } : scope;
				};
			case AST.LocalsExpression:
				return function (scope, locals) {
					return context ? { value: locals } : locals;
				};
			case AST.NGValueParameter:
				return function (scope, locals, assign) {
					return context ? { value: assign } : assign;
				};
		}
	},

	"unary+": function (argument, context) {
		return function (scope, locals, assign) {
			var arg = argument(scope, locals, assign);
			if (isDefined(arg)) {
				arg = +arg;
			} else {
				arg = 0;
			}
			return context ? { value: arg } : arg;
		};
	},
	"unary-": function (argument, context) {
		return function (scope, locals, assign) {
			var arg = argument(scope, locals, assign);
			if (isDefined(arg)) {
				arg = -arg;
			} else {
				arg = -0;
			}
			return context ? { value: arg } : arg;
		};
	},
	"unary!": function (argument, context) {
		return function (scope, locals, assign) {
			var arg = !argument(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary+": function (left, right, context) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			var rhs = right(scope, locals, assign);
			var arg = plusFn(lhs, rhs);
			return context ? { value: arg } : arg;
		};
	},
	"binary-": function (left, right, context) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			var rhs = right(scope, locals, assign);
			var arg = minusFn(lhs, rhs);
			return context ? { value: arg } : arg;
		};
	},
	"binary*": function (left, right, context) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			var rhs = right(scope, locals, assign);
			var arg = timesFn(lhs, rhs);
			return context ? { value: arg } : arg;
		};
	},
	"binary/": function (left, right, context) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			var rhs = right(scope, locals, assign);
			var arg = divideFn(lhs, rhs);
			return context ? { value: arg } : arg;
		};
	},
	"binary%": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = moduloFn(
				left(scope, locals, assign),
				right(scope, locals, assign)
			);
			return context ? { value: arg } : arg;
		};
	},
	"binary===": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) === right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary!==": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) !== right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary==": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) == right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary!=": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) != right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary<": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) < right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary>": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) > right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary<=": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) <= right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary>=": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) >= right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary&&": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) && right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary||": function (left, right, context) {
		return function (scope, locals, assign) {
			var arg = left(scope, locals, assign) || right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"binary??": function (left, right, context) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			var arg =
				lhs != null && typeof lhs !== "undefined"
					? lhs
					: right(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	"ternary?:": function (test, alternate, consequent, context) {
		return function (scope, locals, assign) {
			var arg = test(scope, locals, assign)
				? alternate(scope, locals, assign)
				: consequent(scope, locals, assign);
			return context ? { value: arg } : arg;
		};
	},
	value: function (value, context) {
		return function () {
			return context
				? { context: undefined, name: undefined, value: value }
				: value;
		};
	},
	identifier: function (name, context, create) {
		return function (scope, locals) {
			var base = locals && name in locals ? locals : scope;
			if (create && create !== 1 && base && base[name] == null) {
				base[name] = {};
			}
			var value;
			if (base && hasOwn(base, name)) {
				value = base[name];
			}
			if (context) {
				return { context: base, name: name, value: value };
			}
			return value;
		};
	},
	computedMember: function (left, right, context, create) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			assertSafeValue(lhs);
			var rhs;
			var value;
			if (lhs != null) {
				rhs = right(scope, locals, assign);
				rhs = getStringValue(rhs);
				if (create && create !== 1) {
					if (lhs && !lhs[rhs]) {
						lhs[rhs] = {};
					}
				}
				if (hasOwn(lhs, rhs)) {
					value = lhs[rhs];
				}
			}
			if (context) {
				return { context: lhs, name: rhs, value: value };
			}
			return value;
		};
	},
	nonComputedMember: function (left, right, context, create) {
		return function (scope, locals, assign) {
			var lhs = left(scope, locals, assign);
			assertSafeValue(lhs);
			if (create && create !== 1) {
				if (lhs && lhs[right] == null) {
					lhs[right] = {};
				}
			}
			var value = undefined;
			if (lhs != null && hasOwn(lhs, right)) {
				value = lhs[right];
			}

			if (context) {
				return { context: lhs, name: right, value: value };
			}
			return value;
		};
	},
};

/**
 * @constructor
 */
var Parser = function Parser(lexer, $filter, options) {
	this.lexer = lexer;
	this.$filter = $filter;
	options = options || {};
	options.handleThis = options.handleThis != null ? options.handleThis : true;
	this.options = options;
	this.ast = new AST(lexer, options);
	this.ast.selfReferential = {
		$locals: { type: AST.LocalsExpression },
	};
	if (options.handleThis) {
		this.ast.selfReferential.this = { type: AST.ThisExpression };
	}
	this.astCompiler = options.csp
		? new ASTInterpreter(this.ast, $filter)
		: new ASTCompiler(this.ast, $filter);
};

Parser.prototype = {
	constructor: Parser,

	parse: function (text) {
		return this.astCompiler.compile(text);
	},
};

exports.Lexer = Lexer;
exports.Parser = Parser;
