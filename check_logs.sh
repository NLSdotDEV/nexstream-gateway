#!/usr/bin/env bash
# Read-only monitoring script to inspect runtime container logs safely.

PROJECT_NAME="nexstream-express-gateway"
DEPLOY_DIR="/srv/docker/${PROJECT_NAME}"

if [ ! -d "${DEPLOY_DIR}" ]; then
    echo "Error: Deployment directory ${DEPLOY_DIR} does not exist."
    exit 1
fi

cd "${DEPLOY_DIR}"
echo "Displaying logs for ${PROJECT_NAME} (Press Ctrl+C to exit)..."
docker compose logs -f --tail=100
