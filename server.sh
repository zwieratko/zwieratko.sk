#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

hugo server -D --bind=192.168.111.48 --baseURL=http://192.168.111.48:1313

exit 0
