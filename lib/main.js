"use strict";

var parse = require("./parse.js");

var filters = {};
var Lexer = parse.Lexer;
var Parser = parse.Parser;

/**
 * Compiles src and returns a function that executes src on a target object.
 * To speed up further calls the compiled function is cached under compile.cache[src] if options.filters is not present.
 *
 * @param {string} src
 * @param {object | undefined} options
 * @returns {function}
 */
function compile(src, options) {
	options = options || {};
	var localFilters = options.filters || filters;
	var cache = options.filters ? options.cache || {} : compile.cache;
	var lexerOptions = options;

	var cached;

	if (typeof src !== "string") {
		throw new TypeError(
			"src must be a string, instead saw '" + typeof src + "'"
		);
	}
	var parserOptions = {
		csp: options.csp != null ? options.csp : false, // noUnsafeEval,
		literals:
			options.literals != null
				? options.literals
				: {
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
			return localFilters[name];
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
 * A cache containing all compiled functions. The src is used as key.
 * Set this on false to disable the cache.
 *
 * @type {object}
 */
compile.cache = Object.create(null);

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;
