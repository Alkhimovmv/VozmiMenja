#!/bin/bash

set -euo pipefail

REPOSITORY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../deploy-local.sh
source "$REPOSITORY_DIR/deploy-local.sh"

TEST_PROJECT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/vozmimenya-deploy-test.XXXXXX")"
cleanup_test_project() {
    rm -f "$TEST_PROJECT_DIR/client/public/sitemap.xml"
    rmdir "$TEST_PROJECT_DIR/client/public" "$TEST_PROJECT_DIR/client" "$TEST_PROJECT_DIR"
}
trap cleanup_test_project EXIT

PROJECT_DIR="$TEST_PROJECT_DIR"
mkdir -p "$PROJECT_DIR/client/public"

printf 'manual sitemap\n' > "$PROJECT_DIR/client/public/sitemap.xml"
snapshot_generated_sitemap
printf 'generated sitemap\n' > "$PROJECT_DIR/client/public/sitemap.xml"
restore_generated_sitemap

if [ "$(cat "$PROJECT_DIR/client/public/sitemap.xml")" != "manual sitemap" ]; then
    echo "Existing sitemap was not restored" >&2
    exit 1
fi

rm "$PROJECT_DIR/client/public/sitemap.xml"
snapshot_generated_sitemap
printf 'generated sitemap\n' > "$PROJECT_DIR/client/public/sitemap.xml"
restore_generated_sitemap

if [ -e "$PROJECT_DIR/client/public/sitemap.xml" ]; then
    echo "Generated sitemap was not removed when no source file existed" >&2
    exit 1
fi

echo "deploy sitemap restore tests passed"
