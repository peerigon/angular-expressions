"use strict";

var parse = require("./parse.js");

var filters = Object.create(null);
var Lexer = parse.Lexer;
var Parser = parse.Parser;

var nativeSlice = Array.prototype.slice;
var nativeHasOwn = Object.prototype.hasOwnProperty;
var nativeCall = Function.prototype.call;
var nativeApply = Function.prototype.apply;

var hasOwn = nativeCall.bind(nativeCall, nativeHasOwn);
var $apply = nativeCall.bind(nativeCall, nativeApply);
var slice = nativeCall.bind(nativeCall, nativeSlice);

var defaultCacheLimit = 256;

// Node structure for the Doubly Linked List
function LruNode(key, value) {
	this.key = key;
	this.value = value;
	this.prev = null;
	this.next = null;
}

function isInteger(value) {
	return (
		typeof value === "number" && isFinite(value) && Math.floor(value) === value
	);
}

function LruCache(limit) {
	if (!isInteger(limit) || limit < 0) {
		throw new Error("limit must be a non-negative integer");
	}
	this.limit = limit;
	this.size = 0;
	this.cache = Object.create(null);
	this.head = null; // Most Recently Used (MRU)
	this.tail = null; // Least Recently Used (LRU)
}

// Moves an existing node to the head of the list
LruCache.prototype._moveToHead = function (node) {
	if (node === this.head) {
		return;
	}

	// Disconnect from current position
	if (node.prev) {
		node.prev.next = node.next;
	}
	if (node.next) {
		node.next.prev = node.prev;
	}

	if (node === this.tail) {
		this.tail = node.prev;
	}

	// Insert at head
	node.next = this.head;
	node.prev = null;

	if (this.head) {
		this.head.prev = node;
	}
	this.head = node;

	if (!this.tail) {
		this.tail = node;
	}
};

// Removes the tail node (least recently used)
LruCache.prototype._removeTail = function () {
	if (!this.tail) {
		return null;
	}

	var oldTail = this.tail;
	if (this.tail.prev) {
		this.tail = this.tail.prev;
		this.tail.next = null;
	} else {
		this.head = null;
		this.tail = null;
	}
	return oldTail;
};

LruCache.prototype.get = function (key) {
	if (hasOwn(this.cache, key)) {
		var node = this.cache[key];
		this._moveToHead(node);
		return node.value;
	}
	return undefined;
};

LruCache.prototype.set = function (key, value) {
	if (hasOwn(this.cache, key)) {
		var node = this.cache[key];
		node.value = value;
		this._moveToHead(node);
	} else {
		var newNode = new LruNode(key, value);
		this.cache[key] = newNode;

		// Insert new node at head
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
		} else {
			newNode.next = this.head;
			this.head.prev = newNode;
			this.head = newNode;
		}

		this.size++;

		if (this.size > this.limit) {
			var evicted = this._removeTail();
			if (evicted) {
				delete this.cache[evicted.key];
				this.size--;
			}
		}
	}
};

LruCache.prototype.setMaxSize = function (newSize) {
	if (!isInteger(newSize) || newSize < 0) {
		throw new Error("limit must be a non-negative integer");
	}
	this.limit = newSize;

	while (this.size > this.limit) {
		var evicted = this._removeTail();
		if (evicted) {
			delete this.cache[evicted.key];
			this.size--;
		} else {
			break;
		}
	}
};

function addOptionDefaults(options) {
	options = options || Object.create(null);
	options.filters = options.filters || filters;
	return options;
}

function getParserOptions(options) {
	return {
		handleThis: options.handleThis != null ? options.handleThis : true,
		csp: options.csp != null ? options.csp : false,
		disabledSyntaxes:
			options.disabledSyntaxes != null ? options.disabledSyntaxes : [],
		literals:
			options.literals != null
				? options.literals
				: {
						true: true,
						false: false,
						null: null,
						undefined: undefined,
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
	var parserOptions = getParserOptions(options);
	var lexerOptions = Object.assign({}, options, parserOptions);

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
	function getFilter(name) {
		if (hasOwn(filters, name)) {
			return filters[name];
		}
	}
	var parser = new Parser(lexer, getFilter, parserOptions);

	delete options.src;

	var allOptions = {};
	for (var k in options) {
		if (k === "cache" || k === "filters") {
			continue;
		}
		allOptions[k] = options[k];
	}
	var cacheKey = JSON.stringify(Object.assign({ src: src }, allOptions));

	// Using the LRU interface methods instead of direct bracket access
	var cache = compile.cache.get(cacheKey);
	if (!cache) {
		var fn = parser.parse(src);
		cache = {
			fn: fn,
			parser: parser,
		};
		compile.cache.set(cacheKey, cache);
	}
	function run() {
		cache.parser.astCompiler.$filter = getFilter;
		var args = slice(arguments);
		return $apply(cache.fn, Object.create(null), args);
	}

	function runAssign() {
		cache.parser.astCompiler.$filter = getFilter;
		var args = slice(arguments);
		return $apply(cache.fn.assign, Object.create(null), args);
	}
	run.ast = cache.fn.ast;
	run.assign = runAssign;
	return run;
}

/**
 * A default LRU cache instance containing all compiled functions.
 */
compile.cache = new LruCache(defaultCacheLimit);

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;
