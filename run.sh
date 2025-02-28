#!/usr/bin/env bash

set -eou pipefail

FFPATH=$(which firefox-devedition)

rm -rf distribution

pnpm run build

web-ext run -t firefox-desktop \
	-f $(which firefox-devedition) \
	-u intra.42.fr \
	--devtools \
	--firefox-profile $(pwd)/extdev.improved-seekrs-v3 \
	--keep-profile-changes \
	--profile-create-if-missing
