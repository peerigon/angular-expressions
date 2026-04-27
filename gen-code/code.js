function plus(a,b) { return a + b }
var fn = function (s, l, a, i) {
  var v8,
    v9,
    v10,
    v11 = l && "a" in l,
    v12,
    v13;
  if (!v11) {
    if (s) {
      v12 = s.a;
      if (v12 == null || Object.prototype.hasOwnProperty.call(s, "a")) {
        v10 = v12;
      }
    }
  } else {
    if (Object.prototype.hasOwnProperty.call(l, "a")) {
      v10 = l.a;
    }
  }
  if (
    v10 != null &&
    ((v10.hasOwnProperty(v13) ? v10[v13] : undefined) == null ||
      Object.prototype.hasOwnProperty.call(v10, v13))
  ) {
    v8 = v10.hasOwnProperty(v13) ? v10[v13] : undefined;
  } else {
    v8 = undefined;
  }
  if (
    v8 != null &&
    (v8.c == null || Object.prototype.hasOwnProperty.call(v8, "c"))
  ) {
    v9 = v8.c;
  } else {
    v9 = undefined;
  }
  return v9;
};
fn.assign = function (s, v, l) {
  var v0,
    v1,
    v2,
    v3,
    v4,
    v5 = l && "a" in l,
    v6,
    v7;
  if (!v5) {
    if (s) {
      v6 = s.a;
      if (v6 == null || Object.prototype.hasOwnProperty.call(s, "a")) {
        if (v6 == null) {
          s.a = {};
        }
        v4 = s.a;
      }
    }
  } else {
    if (Object.prototype.hasOwnProperty.call(l, "a")) {
      v4 = l.a;
    }
  }
  if (
    v4 != null &&
    (v4[v7] == null || Object.prototype.hasOwnProperty.call(v4, v7))
  ) {
    if (!v4[v7]) {
      v4[v7] = {};
    }
    v2 = v4[v7];
  } else {
    v2 = undefined;
  }
  if (
    v2 != null &&
    (v2.c == null || Object.prototype.hasOwnProperty.call(v2, "c"))
  ) {
    v3 = v2.c;
  } else {
    v3 = undefined;
  }
  if (
    v2 != null &&
    (Object.prototype.hasOwnProperty.call(v2, "c") || v2.c == null)
  ) {
    v1 = v;
    v0 = v2.c = v1;
  }
  v1 = v;
  return v0;
};
