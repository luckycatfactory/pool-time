#!/bin/sh

yarn build

maximum_gzipped_size=2000
gzipped_size=$(stat -f%z ./dist/bundle.min.js.gz)

if [ $gzipped_size -ge $maximum_gzipped_size ]; then
  echo "The gzipped size of the bundle must be less than $maximum_gzipped_size."
  exit 1
fi

echo "Success! The gzipped size of the bundle is $gzipped_size."
