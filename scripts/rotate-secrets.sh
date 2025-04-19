#!/bin/bash
# EasyShop Secret Rotation Script
# This script automates the rotation of secrets used by the EasyShop application.
# It should be run periodically to maintain security best practices.

set -e

# Configuration
APP_NAME="easyshop"
NAMESPACES=("easyshop-dev" "easyshop-staging" "easyshop-prod")
SECRET_NAME="easyshop-secrets"
BACKUP_DIR="/var/backups/easyshop-secrets"
LOG_FILE="/var/log/easyshop-secret-rotation.log"
ROTATION_FREQUENCY_DAYS=90

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Log function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Check if kubectl is available
if ! command -v kubectl &>/dev/null; then
  log "Error: kubectl not found. Please install kubectl."
  exit 1
fi

# Check AWS CLI is available (for SSM Parameter Store)
if ! command -v aws &>/dev/null; then
  log "Error: AWS CLI not found. Please install aws-cli."
  exit 1
fi

# Generate new secrets
generate_nextauth_secret() {
  openssl rand -base64 32
}

generate_jwt_secret() {
  openssl rand -hex 32
}

generate_api_key() {
  openssl rand -hex 24
}

# Rotate secrets for all environments
for NAMESPACE in "${NAMESPACES[@]}"; do
  log "Starting secret rotation for namespace: $NAMESPACE"
  
  # Backup current secrets
  BACKUP_FILE="$BACKUP_DIR/${NAMESPACE}-${SECRET_NAME}-$(date '+%Y%m%d%H%M%S').yaml"
  log "Backing up current secrets to $BACKUP_FILE"
  kubectl get secret $SECRET_NAME -n $NAMESPACE -o yaml > $BACKUP_FILE
  
  # Generate new secrets
  NEW_NEXTAUTH_SECRET=$(generate_nextauth_secret)
  NEW_JWT_SECRET=$(generate_jwt_secret)
  NEW_API_KEY=$(generate_api_key)
  
  # Store new secrets in AWS Parameter Store for disaster recovery
  log "Storing secrets in AWS Parameter Store"
  aws ssm put-parameter \
    --name "/$APP_NAME/$NAMESPACE/nextauth-secret" \
    --value "$NEW_NEXTAUTH_SECRET" \
    --type "SecureString" \
    --overwrite
  
  aws ssm put-parameter \
    --name "/$APP_NAME/$NAMESPACE/jwt-secret" \
    --value "$NEW_JWT_SECRET" \
    --type "SecureString" \
    --overwrite
  
  aws ssm put-parameter \
    --name "/$APP_NAME/$NAMESPACE/api-key" \
    --value "$NEW_API_KEY" \
    --type "SecureString" \
    --overwrite
  
  # Update Kubernetes secrets
  log "Updating Kubernetes secrets in namespace: $NAMESPACE"
  kubectl create secret generic $SECRET_NAME \
    --namespace $NAMESPACE \
    --from-literal=NEXTAUTH_SECRET="$NEW_NEXTAUTH_SECRET" \
    --from-literal=JWT_SECRET="$NEW_JWT_SECRET" \
    --from-literal=API_KEY="$NEW_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -
  
  # Restart the application to pick up new secrets
  log "Restarting application to apply new secrets"
  kubectl rollout restart deployment $APP_NAME -n $NAMESPACE
  
  # Wait for rollout to complete
  kubectl rollout status deployment $APP_NAME -n $NAMESPACE
  
  log "Secret rotation complete for namespace: $NAMESPACE"
done

# Cleanup old backups (keep last 5)
log "Cleaning up old backup files"
ls -t $BACKUP_DIR | tail -n +6 | xargs -I {} rm $BACKUP_DIR/{}

# Update rotation timestamp
echo "$(date '+%Y-%m-%d')" > $BACKUP_DIR/last_rotation_date

log "Secret rotation completed successfully for all environments"

# Schedule next rotation
NEXT_ROTATION=$(date -d "+$ROTATION_FREQUENCY_DAYS days" '+%Y-%m-%d')
log "Next scheduled rotation: $NEXT_ROTATION"

exit 0 