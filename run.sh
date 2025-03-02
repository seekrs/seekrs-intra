#!/usr/bin/env bash

set -eou pipefail

rm -rf distribution
rm -rf .parcel-cache # because it keeps fucking with me

pnpm run build

if [ "x${1:-}" = "xchrome" ]; then
	web-ext run -t chromium \
		--chromium-binary $(which chromium) \
		-u intra.42.fr \
		--devtools \
		--chromium-profile $(pwd)/extdev-chrome.improved-seekrs-v3 \
		--profile-create-if-missing
else
	web-ext run -t firefox-desktop \
		-f $(which firefox-devedition) \
		-u intra.42.fr \
		--devtools \
		--firefox-profile $(pwd)/extdev.improved-seekrs-v3 \
		--keep-profile-changes \
		--profile-create-if-missing
fi
