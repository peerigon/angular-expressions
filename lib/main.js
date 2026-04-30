"use strict";

var parse = require("./parse.js");

var filters = Object.create(null);
var Lexer = parse.Lexer;
var Parser = parse.Parser;

var nativeHasOwn = Object.prototype.hasOwnProperty;
var nativeCall = Function.prototype.call;
// This creates a function that effectively does:
// nativeCall.call(nativeHasOwn, obj, key)
var hasOwn = nativeCall.bind(nativeCall, nativeHasOwn);

function addOptionDefaults(options) {
	options = options || Object.create(null);
	if (options.filters) {
		options.cache = options.cache || Object.create(null);
	}
	options.cache = options.cache || compile.cache;
	options.filters = options.filters || filters;
	return options;
}

function getParserOptions(options) {
	return {
		handleThis: options.handleThis != null ? options.handleThis : true,
		csp: options.csp != null ? options.csp : false, // noUnsafeEval,
		disabledSyntaxes:
			options.disabledSyntaxes != null ? options.disabledSyntaxes : [],
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
	var filters = Object.create(null);
	if (options.filters) {
		var keys = Object.keys(options.filters);
		for (var i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			var value = options.filters[key];
			if (typeof value === "function") {
				filters[key] = value;
			}
		}
	}
	var parser = new Parser(
		lexer,
		function getFilter(name) {
			if (hasOwn(filters, name)) {
				return filters[name];
			}
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
