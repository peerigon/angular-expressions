(function (root) {
	function slug(string, opts) {
		opts = opts || {};
		// 1. Transform upper to lower
		string = (string || "").toString().toLowerCase();

		var replacement = opts.replacement || "-";
		var charmap = opts.charmap || slug.charmap;
		var result = "";

		for (var i = 0, len = string.length; i < len; i++) {
			var char = string.charAt(i);

			if (charmap[char]) {
				char = charmap[char];
			}

			// 2. Transform [.()] to dash -
			if ([".", "(", ")"].indexOf(char) !== -1) {
				char = "-";
			}

			// Allowed: alphanumeric, underscores, tildes, and existing dashes
			char = char.replace(/[^\w\s\-\_~]/g, "");
			result += char;
		}

		// Final cleanup: trim, collapse spaces/dashes, and remove trailing separator
		result = result.replace(/^\s+|\s+$/g, "");
		result = result.replace(/[-\s]+/g, replacement);

		var endRegex = new RegExp(
			replacement.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$"
		);
		return result.replace(endRegex, "");
	}

	slug.charmap = {
		à: "a",
		á: "a",
		â: "a",
		ã: "a",
		ä: "a",
		å: "a",
		æ: "ae",
		ç: "c",
		è: "e",
		é: "e",
		ê: "e",
		ë: "e",
		ì: "i",
		í: "i",
		î: "i",
		ï: "i",
		ð: "d",
		ñ: "n",
		ò: "o",
		ó: "o",
		ô: "o",
		õ: "o",
		ö: "o",
		ø: "o",
		ù: "u",
		ú: "u",
		û: "u",
		ü: "u",
		ý: "y",
		þ: "th",
		ÿ: "y",
		ß: "ss",
		"€": "euro",
		"&": "and",
		"©": "(c)",
		"®": "(r)",
		"™": "tm",
		// ... add other lowercase mappings as needed
	};

	if (typeof module !== "undefined" && module.exports) {
		module.exports = slug;
	} else {
		root.slug = slug;
	}
})(this);
