#!/usr/bin/env bash
# Runs on the VPS. Called by the Release workflow with IMAGE_REPO and IMAGE_TAG set.
set -euo pipefail

cd "$(dirname "$0")"
: "${IMAGE_REPO:?IMAGE_REPO is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
export IMAGE_REPO IMAGE_TAG

compose() {
  docker compose -f docker-compose.prod.yml "$@"
}

compose --profile tools pull
compose up -d --wait postgres

# Migrations run before the new code starts, so they must stay compatible with the running version.
compose --profile tools run --rm engine-migrate
compose --profile tools run --rm gateway-migrate

compose up -d --wait --remove-orphans
docker image prune -f
