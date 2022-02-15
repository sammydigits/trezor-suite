#!/usr/bin/env bash

set -euxo pipefail

SRC='../../submodules/trezor-common/protob'
DIST='./files/data'

if [ $# -ge 1 ] && [ "$1" == "local" ]
    then
        SRC='../trezor-firmware/common/protob'
fi

# BUILD combined messages.proto file from protobuf files
# this code was copied from ./submodules/trezor-common/protob Makekile

# todo: clearing might not be needed
# clear protobuf syntax and remove unknown values to be able to work with proto2js
echo 'syntax = "proto2";' > $DIST/messages.proto
echo 'import "google/protobuf/descriptor.proto";' >> $DIST/messages.proto
echo "Build proto file from $SRC"
grep -hv -e '^import ' -e '^syntax' -e '^package' -e 'option java_' $SRC/messages*.proto \
| sed 's/ hw\.trezor\.messages\.common\./ /' \
| sed 's/ common\./ /' \
| sed 's/ management\./ /' \
| sed 's/^option /\/\/ option /' \
| grep -v '    reserved '>> $DIST/messages.proto

# BUILD messages.json from message.proto
npx pbjs -t json -p $DIST -o $DIST/messages.json --keep-case messages.proto
rm $DIST/messages.proto
