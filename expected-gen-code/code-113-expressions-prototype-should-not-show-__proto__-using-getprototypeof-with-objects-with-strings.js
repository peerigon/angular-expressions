
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
	var v0, v1, v2, v3;
	v0 = {};
	v1 = 1;
	v0.a = v1; // TSIgnore TS2339
	v2 = "b";
	v3 = 2;
	v0[v2] = v3;
	return v0;
};

