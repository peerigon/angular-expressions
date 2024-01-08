"use strict";

var parse = require("./parse.js");

var filters = {};
var Lexer = parse.Lexer;
var Parser = parse.Parser;

/**
 * Compiles src and returns a function that executes src on a target object.
 * The compiled function is cached under compile.cache[src] to speed up further calls.
 *
 * @param {string} src
 * @param {object} filters filter object containing the the name (key) function (value) mapping.
 * @param {object | undefined} cache cache object that should save the compiled function.
 * @param {object | undefined} lexerOptions
 * @returns {function}
 */
function compileFunction(src, filters, cache, lexerOptions) {
	lexerOptions = lexerOptions || {};

	var cached;

	if (typeof src !== "string") {
		throw new TypeError(
			"src must be a string, instead saw '" + typeof src + "'"
		);
	}
	var parserOptions = {
		csp: false, // noUnsafeEval,
		literals: {
			// defined at: function $ParseProvider() {
			true: true,
			false: false,
			null: null,
			/*eslint no-undefined: 0*/
			undefined: undefined,
			/* eslint: no-undefined: 1  */
		},
	};

	var lexer = new Lexer(lexerOptions);
	var parser = new Parser(
		lexer,
		function getFilter(name) {
			return filters[name];
		},
		parserOptions
	);

	if (!cache) {
		return parser.parse(src);
	}

	cached = cache[src];
	if (!cached) {
		cached = cache[src] = parser.parse(src);
	}

	return cached;
}

/**
 * Compiles src and returns a function that executes src on a target object.
 * The compiled function is cached under compile.cache[src] to speed up further calls.
 *
 * @param {string} src
 * @param {object | undefined} lexerOptions
 * @returns {function}
 */
function compile(src, lexerOptions) {
	return compileFunction(src, filters, compile.cache, lexerOptions);
}

/**
 * A cache containing all compiled functions. The src is used as key.
 * Set this on false to disable the cache.
 *
 * @type {object}
 */
compile.cache = Object.create(null);

/**
 * Class to enclose the filters object for angular-expressions.
 */
var AngularExpressions = (function () {
	/**
	 * @param {object | undefined} filters
	 */
	function AngularExpressions(filters) {
		this.filters = filters || {};
		this.cache = {};
	}

	/**
	 * Compiles src and returns a function that executes src on a target object.
	 * The compiled function is cached under compile.cache[src] to speed up further calls.
	 *
	 * @param {string} src
	 * @param {object | undefined} lexerOptions
	 * @returns {function}
	 */
	AngularExpressions.prototype.compile = function (src, lexerOptions) {
		return compileFunction(src, this.filters, this.cache, lexerOptions);
	};

	return AngularExpressions;
})();

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.AngularExpressions = AngularExpressions;
exports.filters = filters;
