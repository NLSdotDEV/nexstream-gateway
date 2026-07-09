#!/usr/bin/env bash
set -euo pipefail

# Define project name and paths
PROJECT_NAME="nexstream-express-gateway"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================================="
echo " Starting Host Deployment Orchestration for: ${PROJECT_NAME}"
echo "=========================================================="

# 1. Pre-flight Gate: Validate the existence of a production .env file
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    echo "=========================================================="
    echo "CRITICAL ERROR: Missing production .env file."
    echo "Please manually populate target environment secrets before running setup."
    echo "Expected path: ${DEPLOY_DIR}/.env"
    echo "=========================================================="
    exit 1
fi

# Load variables from .env
# shellcheck source=/dev/null
source "${DEPLOY_DIR}/.env"

# 2. Extract target domain from APP_URL variable
if [ -z "${APP_URL:-}" ]; then
    echo "WARNING: APP_URL not defined in .env. Falling back to localhost."
    APP_DOMAIN="localhost"
else
    # Extract only the domain part (remove protocol, path, and port)
    APP_DOMAIN=$(echo "${APP_URL}" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:[0-9]*$||')
    echo "Extracted APP_DOMAIN: ${APP_DOMAIN}"
fi

# 3. Pull/rebuild Docker containers
echo "Rebuilding and starting Docker containers..."
cd "${DEPLOY_DIR}"
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d --wait

# 4. Re-link reverse proxy & reload daemon
echo "Configuring reverse proxy (Caddy)..."
if [ -d "/etc/caddy" ]; then
    # Create configuration folder if missing
    mkdir -p /etc/caddy/conf.d

    # Substitute the {$APP_DOMAIN} placeholder with the extracted domain
    # and copy it to the host caddy directory
    sed "s/__APP_DOMAIN__/$APP_DOMAIN/g" "${DEPLOY_DIR}/docker/Caddyfile" > "/etc/caddy/conf.d/${PROJECT_NAME}.caddy"
    echo "Linked Caddyfile configuration to: /etc/caddy/conf.d/${PROJECT_NAME}.caddy"

    # Warn if the main Caddyfile doesn't import from conf.d
    if ! grep -q "import conf.d/\*" /etc/caddy/Caddyfile 2>/dev/null; then
        echo "=========================================================="
        echo "WARNING: Please ensure your main /etc/caddy/Caddyfile contains:"
        echo "import conf.d/*"
        echo "=========================================================="
    fi

    # Reload host caddy
    if systemctl is-active --quiet caddy; then
        echo "Reloading system Caddy service..."
        systemctl reload caddy
        echo "System Caddy service reloaded successfully."
    else
        echo "WARNING: Caddy service is not active. Please start or reload Caddy manually."
    fi
else
    echo "=========================================================="
    echo "WARNING: /etc/caddy directory not found on host."
    echo "Please configure host reverse proxy manually using the template at:"
    echo "${DEPLOY_DIR}/docker/Caddyfile"
    echo "=========================================================="
fi

echo "=========================================================="
echo " Host Deployment Finished Successfully!"
echo "=========================================================="
