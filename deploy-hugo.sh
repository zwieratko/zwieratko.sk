#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

USER=uid108571
HOST=shellserver-3.websupport.sk
DIR=zwieratko.sk/web/   # the directory where your web site files should go

RANDOMVERSIONNUMBER=$(shuf -i 2000-65000 -n 1)

sed -i "s/const\sversion\s=\s.*;/const version = '$RANDOMVERSIONNUMBER';/g" ./static/sw.js

hugo --gc --minify --cleanDestinationDir && \
echo 'Brotli compression started ...' && \
for x in `/usr/bin/find $HOME/web/zwieratko.sk/public -type f -name '*.html' -o -name '*.css' -o -name '*.js'`; do
	brotli --force --output=${x}.br ${x};
done && \
echo 'Brotli compression is done.' && \
rsync -avzh -e "ssh -p 17036" --delete public/ ${USER}@${HOST}:~/${DIR}

sed -i "s/const\sversion\s=\s.*;/const version = '1';/g" ./static/sw.js

exit 0
