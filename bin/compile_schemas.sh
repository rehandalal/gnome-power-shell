#!/usr/bin/env bash

BIN_DIR="$( dirname "${BASH_SOURCE[0]}" )"
SRC_DIR="$( cd -P "${BIN_DIR}/../src" && pwd )"

for f in $SRC_DIR/extensions/*; do
  if [[ -d ${f} && -d "${f}/schemas" ]]; then
    echo "Compiling schemas in: ${f}"
    glib-compile-schemas "${f}/schemas"
  fi
done
