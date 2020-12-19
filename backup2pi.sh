#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

cd /home/rado/web

rsync -avzh \
--exclude .git \
--exclude .gitmodules \
--exclude backup2pi.sh \
--exclude server.sh \
--exclude node_modules \
--exclude public \
--exclude resources \
--delete \
zwieratko.sk/ \
pi@192.168.3.34:/home/pi/BACKUP/backup.test02

exit 0
