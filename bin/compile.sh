#!/bin/bash

set -ex

if [[ -z "$GITHUB_ACTIONS" ]]; then
    npx rimraf /out
fi

npx tsc --listEmittedFiles $1 -p ./
