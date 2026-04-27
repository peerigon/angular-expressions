function plus(a,b) { return a + b }
var fn = function (s, l, a, i) {
  var v11,
    v12,
    v13,
    v14,
    v15,
    v16,
    v17,
    v18,
    v19,
    v20 = l && "returnsOne" in l,
    v21,
    v22;
  if (i) {
    v11 = i[0];
  } else {
    v17 = {};
    if (
      v17 != null &&
      (v17[v18] == null || Object.prototype.hasOwnProperty.call(v17, v18))
    ) {
      v18 = plus("constructor", "");
    } else {
      v16 = undefined;
    }
    if (
      v16 != null &&
      (v16.getPrototypeOf == null ||
        Object.prototype.hasOwnProperty.call(v16, "getPrototypeOf"))
    ) {
    } else {
      v15 = undefined;
    }
    if (v15 != null) {
      v19 = {};
      v13 = v15(v19);
    } else {
      v13 = undefined;
    }
    if (
      v13 != null &&
      (v13.hasOwnProperty == null ||
        Object.prototype.hasOwnProperty.call(v13, "hasOwnProperty"))
    ) {
    } else {
      v14 = undefined;
    }
    if (
      v13 != null &&
      (Object.prototype.hasOwnProperty.call(v13, "undefined") ||
        v13.undefined == null)
    ) {
      if (!v20) {
        if (s) {
          v21 = s.returnsOne;
          if (
            v21 == null ||
            Object.prototype.hasOwnProperty.call(s, "returnsOne")
          ) {
            v12 = v21;
          }
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(l, "returnsOne")) {
          v12 = l.returnsOne;
        }
      }
      v11 = v13.undefined = v12;
    }
    if (!v20) {
      if (s) {
        v22 = s.returnsOne;
        if (
          v22 == null ||
          Object.prototype.hasOwnProperty.call(s, "returnsOne")
        ) {
          v12 = v22;
        }
      }
    } else {
      if (Object.prototype.hasOwnProperty.call(l, "returnsOne")) {
        v12 = l.returnsOne;
      }
    }
  }
  return [v11];
};
var fn0 = function (s) {
  var v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10;
  v6 = {};
  if (
    v6 != null &&
    (v6[v7] == null || Object.prototype.hasOwnProperty.call(v6, v7))
  ) {
    v7 = plus("constructor", "");
  } else {
    v5 = undefined;
  }
  if (
    v5 != null &&
    (v5.getPrototypeOf == null ||
      Object.prototype.hasOwnProperty.call(v5, "getPrototypeOf"))
  ) {
  } else {
    v4 = undefined;
  }
  if (v4 != null) {
    v8 = {};
    v2 = v4(v8);
  } else {
    v2 = undefined;
  }
  if (
    v2 != null &&
    (v2.hasOwnProperty == null ||
      Object.prototype.hasOwnProperty.call(v2, "hasOwnProperty"))
  ) {
  } else {
    v3 = undefined;
  }
  if (
    v2 != null &&
    (Object.prototype.hasOwnProperty.call(v2, "undefined") ||
      v2.undefined == null)
  ) {
    v9 = s.returnsOne;
    if (v9 == null || Object.prototype.hasOwnProperty.call(s, "returnsOne")) {
      v1 = v9;
    }
    v0 = v2.undefined = v1;
  }
  v10 = s.returnsOne;
  if (v10 == null || Object.prototype.hasOwnProperty.call(s, "returnsOne")) {
    v1 = v10;
  }
  return v0;
};
fn.inputs = [fn0];
