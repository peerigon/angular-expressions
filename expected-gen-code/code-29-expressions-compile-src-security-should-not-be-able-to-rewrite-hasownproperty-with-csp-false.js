
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
	var v0,
		v1,
		v2,
		v3,
		v4,
		v5,
		v6,
		v7,
		v8,
		v9 = l && "returnsOne" in l,
		v10;
	v6 = {};
	v7 = plus("constructor", "");
	v7 = getStringValue(v7);
	assertSafeValue(v6);
	if (v6 != null && (v6[v7] == null || hasOwn(v6, v7))) {
		v5 = v6[v7];
	} else {
		v5 = undefined;
	}
	assertSafeValue(v5);
	assertSafeValue(v5);
	if (
		v5 != null &&
		(v5.getPrototypeOf == null || hasOwn(v5, "getPrototypeOf")) // TSIgnore TS2339
	) {
		v4 = v5.getPrototypeOf; // TSIgnore TS2339
	} else {
		v4 = undefined;
	}
	assertSafeValue(v4);
	if (v4 != null) {
		v8 = {};
		v2 = v5.getPrototypeOf == null ? null : $call(v5.getPrototypeOf, v5, v8); // TSIgnore TS18048
		assertSafeValue(v2);
	} else {
		v2 = undefined;
	}
	assertSafeValue(v2);
	if (
		v2 != null &&
		(v2.hasOwnProperty == null || hasOwn(v2, "hasOwnProperty"))
	) {
		v3 = v2.hasOwnProperty;
	} else {
		v3 = undefined;
	}
	assertSafeValue(v3);
	if (
		v2 != null &&
		(hasOwn(v2, "hasOwnProperty") || v2.hasOwnProperty == null)
	) {
		if (!v9) {
			if (s) {
				v10 = s.returnsOne;
				if (v10 == null || hasOwn(s, "returnsOne")) {
					v1 = v10;
				}
			}
		} else {
			if (hasOwn(l, "returnsOne")) {
				v1 = l.returnsOne;
			}
		}
		assertSafeValue(v1);
		v0 = v2["hasOwnProperty"] = v1;
	} else {
		v0 = undefined;
	}
	return [v0];
};

