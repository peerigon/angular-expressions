
function assertSafeValue(value) {
    function setTimeout(fn, time) { return true; }
    var MAX_STRING_LENGTH = 5242880; var dangerousObjects = [globalThis, eval, setTimeout, Object]; var isDangerousObject = false; for (var i = 0; i < dangerousObjects.length; i++) { if (dangerousObjects[i] === value) { isDangerousObject = true; } } if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) { throw new Error('string too long'); } if (isDangerousObject) { throw new Error( 'Security Error: Direct operations on the global scope are forbidden.'); } }
        function getStringValue(name) { return name + ''; }
        function ifDefined(v, d) { return typeof v !== 'undefined' ? v : d; }
        function modulo(l, r) { if (l == null || r == null) { return undefined; } return l % r; }
        const $filter = Object.create(null);
        function plus(a,b) { return a + b } function minus(a,b) { return a -b } function times(a,b) { return a*b } function divide(a,b) { return a / b }
        var nativeHasOwn = Object.prototype.hasOwnProperty;
        var nativeCall = Function.prototype.call; var $call = Function.prototype.call.bind(Function.prototype.call);
        // This creates a function that effectively does:
        // nativeCall.call(nativeHasOwn, obj, key)
        /**
        * @param {any} obj
        * @param {string|number} key
        * @returns {obj is Record<string, any>}
        */
        var hasOwn = function(obj, key) {
            return nativeCall.call(nativeHasOwn, obj, key);
        };
        var fn = function (s, l) {
	var v0, v1, v2, v3, v4, v5, v6, v7;
	v4 = "";
	v5 = plus("c", "onstructor");
	assertSafeValue(v4);
	if (
		v4 != null &&
		((hasOwn(v4, v5) ? v4[v5] : undefined) == null || hasOwn(v4, v5))
	) {
		v3 = hasOwn(v4, v5) ? v4[v5] : undefined;
	} else {
		v3 = undefined;
	}
	v6 = plus("c", "onstructor");
	assertSafeValue(v3);
	if (
		v3 != null &&
		((hasOwn(v3, v6) ? v3[v6] : undefined) == null || hasOwn(v3, v6))
	) {
		v2 = hasOwn(v3, v6) ? v3[v6] : undefined;
	} else {
		v2 = undefined;
	}
	if (v2 != null) {
		v7 = "return process\u003b";
		v1 =
			(hasOwn(v3, v6) ? v3[v6] : undefined) == null // TSIgnore TS18048
				? null
				: $call(v3[v6], v3, v7); // TSIgnore TS18048
		assertSafeValue(v1);
	} else {
		v1 = undefined;
	}
	if (v1 != null) {
		v0 = v1();
		assertSafeValue(v0);
	} else {
		v0 = undefined;
	}
	return v0;
};

