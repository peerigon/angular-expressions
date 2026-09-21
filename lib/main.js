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

function copyFunctionMap(source) {
	var out = Object.create(null);
	if (!source) {
		return out;
	}
	var keys = Object.keys(source);
	for (var i = 0, len = keys.length; i < len; i++) {
		var key = keys[i];
		var value = source[key];
		if (typeof value === "function") {
			out[key] = value;
		}
	}
	return out;
}

function snapshotOwnMap(obj) {
	if (obj == null || (typeof obj !== "object" && typeof obj !== "function")) {
		return obj;
	}
	var copy = Object.create(null);
	var keys = Object.keys(obj);
	for (var i = 0, len = keys.length; i < len; i++) {
		var key = keys[i];
		copy[key] = obj[key];
	}
	return copy;
}

function copyOwnIfPresent(src, snap, key) {
	if (hasOwn(src, key)) {
		snap[key] = src[key];
	}
}

function snapshotOptions(options) {
	var src = options || Object.create(null);
	var snap = Object.create(null);

	if (hasOwn(src, "filters") && src.filters) {
		snap.filters = src.filters;
	} else {
		snap.filters = filters;
	}

	copyOwnIfPresent(src, snap, "handleThis");
	copyOwnIfPresent(src, snap, "csp");
	copyOwnIfPresent(src, snap, "disabledSyntaxes");
	copyOwnIfPresent(src, snap, "literals");
	copyOwnIfPresent(src, snap, "isIdentifierStart");
	copyOwnIfPresent(src, snap, "isIdentifierContinue");
	copyOwnIfPresent(src, snap, "cacheSize");
	return snap;
}

function ownOrDefault(snap, key, fallback) {
	if (hasOwn(snap, key) && snap[key] != null) {
		return snap[key];
	}
	return fallback;
}

function getParserOptionsFromSnap(snap) {
	return {
		handleThis: ownOrDefault(snap, "handleThis", true),
		csp: ownOrDefault(snap, "csp", false),
		disabledSyntaxes: ownOrDefault(snap, "disabledSyntaxes", []),
		literals: ownOrDefault(snap, "literals", {
			true: true,
			false: false,
			null: null,
			undefined: undefined,
		}),
	};
}

function isJsonSafeLiteralValue(value) {
	if (value === null) {
		return true;
	}
	var valueType = typeof value;
	if (valueType === "string" || valueType === "boolean") {
		return true;
	}
	if (valueType === "number") {
		return isFinite(value) && (value !== 0 || 1 / value !== -Infinity);
	}
	return false;
}

function literalsAreJsonSafe(literals) {
	if (literals == null) {
		return true;
	}
	if (typeof literals !== "object") {
		return false;
	}
	var keys = Object.keys(literals);
	for (var i = 0, len = keys.length; i < len; i++) {
		if (!isJsonSafeLiteralValue(literals[keys[i]])) {
			return false;
		}
	}
	return true;
}

function ownIsNonBoolean(snap, key) {
	return hasOwn(snap, key) && typeof snap[key] !== "boolean";
}

function canUseGlobalCache(snap) {
	if (
		typeof snap.isIdentifierStart === "function" ||
		typeof snap.isIdentifierContinue === "function"
	) {
		return false;
	}
	if (ownIsNonBoolean(snap, "csp") || ownIsNonBoolean(snap, "handleThis")) {
		return false;
	}
	if (
		hasOwn(snap, "disabledSyntaxes") &&
		!Array.isArray(snap.disabledSyntaxes)
	) {
		return false;
	}
	return !(hasOwn(snap, "literals") && !literalsAreJsonSafe(snap.literals));
}

function literalsKeyPart(literals) {
	if (!literals) {
		return null;
	}
	var keys = Object.keys(literals).sort();
	var parts = [];
	for (var i = 0, len = keys.length; i < len; i++) {
		parts.push([keys[i], literals[keys[i]]]);
	}
	return parts;
}

function makeCacheKey(src, snap) {
	return JSON.stringify({
		src: src,
		csp: snap.csp === true,
		handleThis: snap.handleThis !== false,
		disabledSyntaxes: Array.isArray(snap.disabledSyntaxes)
			? snap.disabledSyntaxes
			: [],
		literals: hasOwn(snap, "literals") ? literalsKeyPart(snap.literals) : null,
	});
}

function compileWith(src, snap, cache, cacheKey) {
	var parserOptions = getParserOptionsFromSnap(snap);
	var lexerOptions = {
		handleThis: parserOptions.handleThis,
		csp: parserOptions.csp,
		disabledSyntaxes: parserOptions.disabledSyntaxes,
		literals: parserOptions.literals,
	};
	if (typeof snap.isIdentifierStart === "function") {
		lexerOptions.isIdentifierStart = snap.isIdentifierStart;
	}
	if (typeof snap.isIdentifierContinue === "function") {
		lexerOptions.isIdentifierContinue = snap.isIdentifierContinue;
	}

	var filterMap = copyFunctionMap(snap.filters);
	function getFilter(name) {
		if (hasOwn(filterMap, name)) {
			return filterMap[name];
		}
	}

	var cacheEntry = cacheKey && cache ? cache.get(cacheKey) : undefined;
	if (!cacheEntry) {
		var lexer = new Lexer(lexerOptions);
		var parser = new Parser(lexer, getFilter, parserOptions);
		var fn = parser.parse(src);
		cacheEntry = {
			fn: fn,
			parser: parser,
		};
		if (cacheKey && cache) {
			cache.set(cacheKey, cacheEntry);
		}
	}

	function run() {
		cacheEntry.parser.astCompiler.$filter = getFilter;
		var args = slice(arguments);
		return $apply(cacheEntry.fn, Object.create(null), args);
	}

	function runAssign() {
		cacheEntry.parser.astCompiler.$filter = getFilter;
		var args = slice(arguments);
		return $apply(cacheEntry.fn.assign, Object.create(null), args);
	}

	run.ast = cacheEntry.fn.ast;
	run.assign = runAssign;
	return run;
}

function assertStringSrc(src) {
	if (typeof src !== "string") {
		throw new TypeError(
			"src must be a string, instead saw '" + typeof src + "'"
		);
	}
}

function compile(src, options) {
	assertStringSrc(src);
	var snap = snapshotOptions(options);
	var cache = null;
	var cacheKey = null;
	if (canUseGlobalCache(snap)) {
		cache = compile.cache;
		cacheKey = makeCacheKey(src, snap);
	}
	return compileWith(src, snap, cache, cacheKey);
}

function withOptions(options) {
	var snap = snapshotOptions(options);
	snap.filters = copyFunctionMap(snap.filters);
	if (hasOwn(snap, "literals")) {
		snap.literals = snapshotOwnMap(snap.literals);
	}
	if (Array.isArray(snap.disabledSyntaxes)) {
		snap.disabledSyntaxes = snap.disabledSyntaxes.slice();
	}

	var cacheSize = defaultCacheLimit;
	if (hasOwn(snap, "cacheSize") && snap.cacheSize != null) {
		cacheSize = snap.cacheSize;
	}
	var instanceCache = new LruCache(cacheSize);

	function boundCompile(src) {
		assertStringSrc(src);
		return compileWith(src, snap, instanceCache, src);
	}

	return boundCompile;
}

compile.withOptions = withOptions;

/**
 * A default LRU cache instance containing all compiled functions.
 */
compile.cache = new LruCache(defaultCacheLimit);

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;
