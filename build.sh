#!/usr/bin/env bash

if [ -f .env.local ]; then
  source .env.local
fi

if [ -z "$AMO_UID" ]; then
  echo "AMO_UID is not set"
  exit 1
fi

if [ -z "$AMO_SECRET" ]; then
  echo "AMO_SECRET is not set"
  exit 1
fi

pnpm run build

rm -rf source-archive.tar.gz
tar -cvf source-archive.tar.gz README.md source .editorconfig .envrc .parcelrc .postcssrc .terserrc LICENSE package.json pnpm-lock.yaml README.md run.sh build.sh .env.local.example

web-ext sign -s distribution --api-key $AMO_UID --api-secret $AMO_SECRET --channel unlisted --upload-source-code source-archive.tar.gz
