
        function getStringValue(name) { return name + ''; }
        function ifDefined(v, d) { return typeof v !== 'undefined' ? v : d; }
        const $filter = Object.create(null);
        function plus(a,b) { return a + b }
        var nativeHasOwn = Object.prototype.hasOwnProperty;
        var nativeCall = Function.prototype.call;
        // This creates a function that effectively does:
        // nativeCall.call(nativeHasOwn, obj, key)
        /**
        * @param {any} obj
        * @param {string} key
        * @returns {obj is Record<string, any>}
        */
        var hasOwn = function(obj, key) {
            return nativeCall.call(nativeHasOwn, obj, key);
        };
        var fn = function (s, l, a, i) {
	var v4, v5;
	v4 = "abc";
	if (v4 != null && (v4.length == null || hasOwn(v4, "length"))) {
		v5 = v4.length;
	} else {
		v5 = undefined;
	}
	return v5;
};
fn.assign = function (s, v, l) {
	var v0, v1, v2, v3;
	v2 = "abc";
	if (v2 != null && (v2.length == null || hasOwn(v2, "length"))) {
		v3 = v2.length;
	} else {
		v3 = undefined;
	}
	if (v2 != null && (hasOwn(v2, "length") || v2.length == null)) {
		v1 = v;
		v0 = v2.length = v1; // TSIgnore TS2540
	}
	v1 = v;
	return v0;
};

