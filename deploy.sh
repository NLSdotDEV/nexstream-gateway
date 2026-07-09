#!/usr/bin/env bash
# Local Deployment Script
# Runs on the developer's local machine to deploy the gateway to the VPS.

set -euo pipefail

# Configuration defaults (can be overridden via environment variables or .env.deploy)
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
PROJECT_NAME="nexstream-express-gateway"
TARGET_DIR="/srv/docker/${PROJECT_NAME}"

# Load local deployment configuration if it exists
if [ -f .env.deploy ]; then
    # shellcheck source=/dev/null
    source .env.deploy
fi

# Verify connection details are provided
if [ -z "${DEPLOY_HOST}" ]; then
    echo "Error: DEPLOY_HOST is not set."
    echo "Please set DEPLOY_HOST in your environment or create a local '.env.deploy' file:"
    echo "  DEPLOY_HOST=\"your.server.ip\""
    echo "  DEPLOY_USER=\"root\""
    echo "  DEPLOY_PORT=\"22\""
    exit 1
fi

echo "=========================================================="
echo " Preparing deployment of: ${PROJECT_NAME}"
echo " Destination: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PORT}"
echo "=========================================================="

# 1. Sync files to the target VPS path using rsync
echo "Syncing files to server..."
rsync -avz -e "ssh -p ${DEPLOY_PORT}" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.bak' \
    --exclude='.env' \
    --exclude='.env.deploy' \
    ./ "${DEPLOY_USER}@${DEPLOY_HOST}:${TARGET_DIR}/"

# 2. Run the host setup.sh script remotely
echo "Executing setup script on remote server..."
ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" \
    "chmod +x ${TARGET_DIR}/setup.sh && ${TARGET_DIR}/setup.sh"

echo "=========================================================="
echo " Deployment completed successfully!"
echo " Monitor container logs by running:"
echo "   ssh -p ${DEPLOY_PORT} ${DEPLOY_USER}@${DEPLOY_HOST} \"${TARGET_DIR}/check_logs.sh\""
echo "=========================================================="
