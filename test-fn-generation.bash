#!/usr/bin/env bash

set -euo pipefail
export PATH="./node_modules/.bin/:$PATH"

node ./node_modules/.bin/mocha test/main.test.js || true
prettier /tmp/code.js >gen-code/code.js
sed -i '$d' gen-code/code.js
sed -i '1d' gen-code/code.js

c="$(cat gen-code/code.js)"
echo "function plus(a,b) { return a + b }
$c"  >gen-code/code.js

code=0
tsc gen-code/code.js --allowJs --checkJs --noEmit --noImplicitAny false || code="$?"
if [ "$code" != "0" ]; then
    echo "Typescript did not validate this file"
    cat gen-code/code.js
    exit "$code"
fi
echo "Typescript ok !"

cd gen-code
../node_modules/.bin/eslint --config eslint.config.mjs code.js
echo "Eslint ok"
