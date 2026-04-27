#!/usr/bin/env bash

set -euo pipefail

node ./node_modules/.bin/mocha test/main.test.js || true
prettier /tmp/code.js >gen-code-eslint/code.js
sed -i '$d' gen-code-eslint/code.js
sed -i '1d' gen-code-eslint/code.js

c="$(cat gen-code-eslint/code.js)"
echo "function plus(a,b) { return a + b }
$c"  >gen-code-eslint/code.js

npx tsc gen-code-eslint/code.js --allowJs --checkJs --noEmit
