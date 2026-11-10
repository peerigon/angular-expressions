#!/usr/bin/env bash
set -euo pipefail

# lib/parse.js must ship with the hook commented out: `global` does not exist in browsers.
if grep -q '^\s*if (global' lib/parse.js; then
    echo "lib/parse.js: storeFnString hook is not commented out" >&2
    exit 1
fi
