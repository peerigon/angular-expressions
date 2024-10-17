"use strict";

var parse = require("./parse.js");

var filters = {};
var Lexer = parse.Lexer;
var Parser = parse.Parser;

function addOptionDefaults(options) {
	options = options || {};
	if (options.filters) {
		options.cache = options.cache || {};
	}
	options.cache = options.cache || compile.cache;
	options.filters = options.filters || filters;
	return options;
}

function getParserOptions(options) {
	return {
		handleThis: options.handleThis != null ? options.handleThis : true,
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
}

/**
 * Compiles src and returns a function that executes src on a target object.
 * To speed up further calls the compiled function is cached under compile.cache[src] if options.filters is not present.
 *
 * @param {string} src
 * @param {object | undefined} options
 * @returns {function}
 */
function compile(src, options) {
	if (typeof src !== "string") {
		throw new TypeError(
			"src must be a string, instead saw '" + typeof src + "'"
		);
	}
	options = addOptionDefaults(options);
	var lexerOptions = options;
	var parserOptions = getParserOptions(options);

	var lexer = new Lexer(lexerOptions);
	var parser = new Parser(
		lexer,
		function getFilter(name) {
			return options.filters[name];
		},
		parserOptions
	);

	if (!options.cache) {
		return parser.parse(src);
	}
	delete options.src;
	var cacheKey = JSON.stringify(Object.assign({ src: src }, options));

	var cached = options.cache[cacheKey];
	if (!cached) {
		cached = options.cache[cacheKey] = parser.parse(src);
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
