#!/bin/sh
set -e

echo "Generating runtime configuration..."

# Generate config.js from template using environment variables
if [ -f /app/public/config.template.js ]; then
  envsubst < /app/public/config.template.js > /app/public/config.js
  echo "Configuration generated successfully:"
  cat /app/public/config.js
else
  echo "Warning: /app/public/config.template.js not found, skipping runtime config generation."
fi

echo "Starting Notification Admin web application..."
exec node server.js
