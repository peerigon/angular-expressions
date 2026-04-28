
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
	var v0, v1, v2, v3, v4, v5, v6, v7;
	v4 = "";
	v5 = plus("c", "onstructor");
	if (
		v4 != null &&
		((hasOwn(v4, v5) ? v4[v5] : undefined) == null || hasOwn(v4, v5))
	) {
		v3 = hasOwn(v4, v5) ? v4[v5] : undefined;
	} else {
		v3 = undefined;
	}
	v6 = plus("c", "onstructor");
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
			(hasOwn(v3, v6) ? v3[v6] : undefined) == null
				? null
				:  v3[v6].call(v3, v7); // TSIgnore TS18048 , TSIgnore TS2339
	} else {
		v1 = undefined;
	}
	if (v1 != null) {
		v0 = v1();
	} else {
		v0 = undefined;
	}
	return v0;
};

