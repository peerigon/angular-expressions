
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
	var v4, v5;
	v4 = "abc";
	if (v4 != null && (v4.length == null || hasOwn(v4, "length"))) {
		v5 = v4.length;
	} else {
		v5 = undefined;
	}
	return v5;
};
