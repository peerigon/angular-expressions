
        function getStringValue(name) { return name + ''; }
        function ifDefined(v, d) { return typeof v !== 'undefined' ? v : d; }
        const $filter = Object.create(null);
        function plus(a,b) { return a + b }
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
        var fn = function (s, l, a, i) {
	var v7, v8, v9, v10, v11;
	v10 = s;
	v11 = plus("constructor", "");
	if (
		v10 != null &&
		((hasOwn(v10, v11) ? v10[v11] : undefined) == null || hasOwn(v10, v11))
	) {
		v9 = hasOwn(v10, v11) ? v10[v11] : undefined;
	} else {
		v9 = undefined;
	}
	v7 = { O: v9 };
	if (v7 != null && (v7.O == null || hasOwn(v7, "O"))) {
		v8 = v7.O;
	} else {
		v8 = undefined;
	}
	return v8;
};
fn.assign = function (s, v, l) {
	var v0, v1, v2, v3, v4, v5, v6;
	v5 = s;
	v6 = plus("constructor", "");
	if (v5 != null && (v5[v6] == null || hasOwn(v5, v6))) {
		v4 = v5[v6];
	} else {
		v4 = undefined;
	}
	v2 = { O: v4 };
	if (v2 != null && (v2.O == null || hasOwn(v2, "O"))) {
		v3 = v2.O;
	} else {
		v3 = undefined;
	}
	if (v2 != null && (hasOwn(v2, "O") || v2.O == null)) { // TSIgnore TS2339
		v1 = v;
		v0 = v2.O = v1;
	}
	v1 = v;
	return v0;
};

