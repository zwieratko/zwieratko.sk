#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

hugo --gc --minify --buildDrafts --buildExpired --buildFuture --baseURL http://192.168.111.48:8002 && rsync -avzh --delete public/ /home/rado/web/zwieratko.sk.draft

hugo --gc --minify --cleanDestinationDir  --baseURL http://192.168.111.48:8001 && rsync -avzh --delete public/ /home/rado/web/zwieratko.sk.public

exit 0
