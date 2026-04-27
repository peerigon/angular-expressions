#!/usr/bin/env bash

set -euo pipefail
export PATH="./node_modules/.bin/:$PATH"

node ./node_modules/.bin/mocha test/main.test.js || true
prettier /tmp/code.js >gen-code-eslint/code.js
sed -i '$d' gen-code-eslint/code.js
sed -i '1d' gen-code-eslint/code.js

c="$(cat gen-code-eslint/code.js)"
echo "function plus(a,b) { return a + b }
$c"  >gen-code-eslint/code.js

code=0
tsc gen-code-eslint/code.js --allowJs --checkJs --noEmit --noImplicitAny false || code="$?"
if [ "$code" != "0" ]; then
    echo "Typescript did not validate this file"
    cat gen-code-eslint/code.js
    exit "$code"
fi
echo "Typescript ok !"

cd gen-code-eslint
../node_modules/.bin/eslint --config eslint.config.mjs code.js
echo "Eslint ok"
