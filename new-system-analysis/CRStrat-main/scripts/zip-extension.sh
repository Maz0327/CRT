#!/usr/bin/env bash
set -euo pipefail
cd extension
zip -r ../extension.zip .
echo "Created extension.zip"