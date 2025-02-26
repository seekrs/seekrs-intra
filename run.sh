#!/usr/bin/env bash

FFPATH=$(which firefox-devedition)
web-ext run -t firefox-desktop \
	-f $(which firefox-devedition) \
	-u intra.42.fr \
	--devtools \
	--firefox-profile $(pwd)/extdev.improved-seekrs-v3 \
	--keep-profile-changes \
	--profile-create-if-missing
