#!/usr/bin/env bash

set -euo pipefail
export PATH="./node_modules/.bin/:$PATH"

BAILOUT="${BAILOUT:-false}"
FILTER="${FILTER:-}"

rm -rf gen-code/
mkdir gen-code
git checkout -- gen-code/eslint.config.mjs

sed -i 's/\/\/ if (global.storeFnString) { global.storeFnString(fnString); }/if (global.storeFnString) { global.storeFnString(fnString); }/' lib/parse.js
node --expose-gc ./node_modules/.bin/mocha test/main.test.js || true
sed -i 's/^[[:blank:]]*if (global.storeFnString) { global.storeFnString(fnString); }/\t\t\/\/ if (global.storeFnString) { global.storeFnString(fnString); }/' lib/parse.js

files_array=(gen-code/*.js)

test() {
    set -euo pipefail
    file="$1"
    prettier --write "$file" --ignore-path /dev/null >/dev/null
    sed -i '$d' "$file"
    sed -i '1d' "$file"

    c="$(cat "$file")"

    echo "
function assertSafeValue(value) {
    function setTimeout(fn, time) { return true; }
    var MAX_STRING_LENGTH = 5242880; var dangerousObjects = [globalThis, eval, setTimeout, Object]; var isDangerousObject = false; for (var i = 0; i < dangerousObjects.length; i++) { if (dangerousObjects[i] === value) { isDangerousObject = true; } } if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) { throw new Error('string too long'); } if (isDangerousObject) { throw new Error( 'Security Error: Direct operations on the global scope are forbidden.'); } }
        function getStringValue(name) { return name + ''; }
        function ifDefined(v, d) { return typeof v !== 'undefined' ? v : d; }
        function modulo(l, r) { if (l == null || r == null) { return undefined; } return l % r; }
        const \$filter = Object.create(null);
        function plus(a,b) { return a + b } function minus(a,b) { return a -b } function times(a,b) { return a*b } function divide(a,b) { return a / b }
        var nativeHasOwn = Object.prototype.hasOwnProperty;
        var nativeCall = Function.prototype.call; var \$call = Function.prototype.call.bind(Function.prototype.call);
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
        $c
    " | sed '/fn\.assign = function (s, v, l) {/,$d' >"$file"

    code=0
    tsc_result="$(tsc "$file" --allowJs --checkJs --noEmit --noImplicitAny false)" || code="$?"

    expected_file="$(echo "$file" | sed -E 's/gen-code/expected-gen-code/g')"
    if [ "$code" = 0 ] && [ -f "$expected_file" ]; then
        echo "Found expected_file for a working file : $file / $expected_file"
        exit 1
    fi
    if [ "$code" != 0 ]; then
        if [ "$tsc_result" = "" ]; then
            echo "tsc output was empty, that is unexpected because tsc failed"
            exit 3
        fi
        if [ -f "$expected_file" ]; then
            ignores="$(grep --line-number --extended --only-matching "TS[0-9]+" <"$expected_file" || true)"
            while read -r ignore; do
                line="$(sed -E 's/^([0-9]+):(TS[0-9]+)/\1/g' <<<"$ignore")"
                rule="$(sed -E 's/^([0-9]+):(TS[0-9]+)/\2/g' <<<"$ignore")"
                if [ "$line" = "" ] || [ "$rule" = "" ]; then
                    continue
                fi
                tsc_result="$(grep -vE "\.js.$line.*: error $rule" <<<"$tsc_result" || true)"
            done <<<"$ignores"
            if [ "$tsc_result" = "" ]; then
                return 0
            fi
        fi
        echo TSC_RESULT
        echo "$tsc_result"
        echo "$tsc_result" | wc -l
        exit "$code"
    fi

    code=0
    ./node_modules/.bin/eslint --config gen-code/eslint.config.mjs "$file" || code="$?"
    if [ "$code" != 0 ]; then
        echo "Eslint did not validate this file : '$file'"
        cat "$file"
        exit "$code"
    fi
}
export -f test

MAX_PROCS="80%"

parallel_log="$(mktemp /tmp/fn-validator-XXXX.log)"
parallel_options=(--line-buffer --bar --max-procs "$MAX_PROCS" --joblog "$parallel_log")
if [ "$BAILOUT" = "true" ]; then
    parallel_options+=(--halt "now,fail=1")
else
    parallel_options+=(--halt "never,fail=1")
fi
parallel_options+=(test)

files="$(printf "%s\n" "${files_array[@]}")"
if [ "$FILTER" != "" ]; then
    files="$(grep <<<"$files" "$FILTER")"
fi
echo "Found $(wc -l <<<"$files") files to analyze"
parallel_result=0
parallel "${parallel_options[@]}" <<<"$files" 2>&1 || parallel_result="$?"

if [ "$parallel_result" != 0 ]; then
    echo
    echo ======================
    echo
    echo "Failures for following files :"
    awk <"$parallel_log" '{ if ($7 != "0" && $7 != "Exitval") { print $10 } }'
    exit "$parallel_result"
fi



