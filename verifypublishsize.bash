#!/usr/bin/env bash
set -euo pipefail

rm -rf -- *.tgz
npm pack .
size="$(wc -c <*.tgz)"
echo "size is $size"

if [ "$size" -gt 300000 ]; then
	echo "Size exceeds 300kB, abort publish"
	exit 1
fi

files="$(tar -ztvf *.tgz)"

echo files
echo "$files"

if grep "\.bash" <<<"$files"; then
	echo "Found bash files in npm package prepared for publish"
	exit 1
fi

files_count="$(wc -l <<<"$files")"
if [ "$files_count" -gt "20" ]; then
	echo "Too many files in npm package prepared for publish"
	exit 1
fi
