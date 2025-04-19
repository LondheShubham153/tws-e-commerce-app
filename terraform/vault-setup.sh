#!/bin/bash
set -e

# Production vault setup script with actual implementation
# Run this after Vault is initialized and unsealed

# Set Vault address
VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_ADDR

# Check if VAULT_TOKEN is set
if [ -z "$VAULT_TOKEN" ]; then
  echo "Please set VAULT_TOKEN environment variable to the root token"
  exit 1
fi

# Create log directory with proper permissions
sudo mkdir -p /var/log/vault
sudo chown vault:vault /var/log/vault
sudo chmod 755 /var/log/vault

# Enable audit logging to file
echo "Enabling audit logging..."
vault audit enable file file_path=/var/log/vault/audit.log

# Enable audit logging to syslog for central log collection
vault audit enable syslog tag="vault" facility="AUTH"

# Enable necessary secrets engines
echo "Enabling secrets engines..."
vault secrets enable -version=2 -path=secret kv
vault secrets enable aws
vault secrets enable database
vault secrets enable transit
vault secrets enable pki

# Configure PKI secrets engine
echo "Configuring PKI secrets engine..."
vault secrets tune -max-lease-ttl=87600h pki
vault write pki/root/generate/internal \
  common_name="easyshop.internal" \
  ttl=87600h

# Configure AWS secrets engine with actual permissions
echo "Configuring AWS secrets engine..."
vault write aws/config/root \
  region=${AWS_REGION} \
  max_retries=5

# Create IAM policy for application role
cat > app-iam-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::easyshop-app-bucket",
        "arn:aws:s3:::easyshop-app-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/easyshop-*"
      ]
    }
  ]
}
EOF

# Create AWS role for application
vault write aws/roles/application-role \
  credential_type=iam_user \
  policy_document=@app-iam-policy.json

# Configure PostgreSQL database secrets
vault write database/config/postgresql \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@db-postgresql.database.svc.cluster.local:5432/postgres?sslmode=require" \
  allowed_roles="application-db,readonly-db" \
  username="vault" \
  password="YourStrongPasswordHere" \
  password_authentication="scram-sha-256"

# Create database role for application
vault write database/roles/application-db \
  db_name=postgresql \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
                      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\"; \
                      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Create read-only database role
vault write database/roles/readonly-db \
  db_name=postgresql \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
                      GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Create a policy for application access
echo "Creating application policy..."
cat > app-policy.hcl << EOF
# Allow applications to read KV secrets
path "secret/data/application/*" {
  capabilities = ["read"]
}

# Allow applications to read AWS credentials with specific role
path "aws/creds/application-role" {
  capabilities = ["read"]
}

# Allow application to get database credentials
path "database/creds/application-db" {
  capabilities = ["read"]
}

# Allow application to use transit engine for encryption/decryption
path "transit/encrypt/app-key" {
  capabilities = ["update"]
}

path "transit/decrypt/app-key" {
  capabilities = ["update"]
}

# Deny all other paths by default
path "*" {
  capabilities = ["deny"]
}
EOF

# Create readonly policy
cat > readonly-policy.hcl << EOF
# Allow read only access to secrets
path "secret/data/application/*" {
  capabilities = ["read"]
}

# Allow read only access to DB
path "database/creds/readonly-db" {
  capabilities = ["read"]
}
EOF

# Write policies to Vault
vault policy write application app-policy.hcl
vault policy write readonly readonly-policy.hcl

# Enable Kubernetes authentication for EKS
echo "Enabling Kubernetes authentication..."
vault auth enable kubernetes

# Get EKS cluster details
EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name)
EKS_HOST=$(terraform output -raw eks_cluster_endpoint)
EKS_CA_CERT=$(terraform output -raw eks_cluster_certificate_authority_data | base64 -d)

# Configure Kubernetes authentication with proper service account
kubectl create namespace vault-system || true
kubectl create serviceaccount vault-auth -n vault-system || true
kubectl create clusterrolebinding vault-auth-delegator --clusterrole=system:auth-delegator --serviceaccount=vault-system:vault-auth || true

# Get service account token
TOKEN_REVIEW_JWT=$(kubectl get secret \
    $(kubectl get serviceaccount vault-auth -n vault-system -o jsonpath='{.secrets[0].name}') \
    -n vault-system -o jsonpath='{.data.token}' | base64 --decode)

# Configure Kubernetes authentication in Vault
vault write auth/kubernetes/config \
  kubernetes_host="$EKS_HOST" \
  kubernetes_ca_cert="$EKS_CA_CERT" \
  token_reviewer_jwt="$TOKEN_REVIEW_JWT" \
  issuer="https://kubernetes.default.svc.cluster.local" \
  disable_iss_validation="true"

# Create Kubernetes auth roles for different service accounts
vault write auth/kubernetes/role/application \
  bound_service_account_names=application-sa \
  bound_service_account_namespaces=application \
  policies=application \
  ttl=1h

vault write auth/kubernetes/role/readonly \
  bound_service_account_names=readonly-sa \
  bound_service_account_namespaces=application,monitoring \
  policies=readonly \
  ttl=1h

# Create an encryption key in Transit
vault write -f transit/keys/app-key

# Create production application secrets
echo "Creating production application secrets..."
vault kv put secret/application/database \
  username="app_user" \
  password="$(openssl rand -base64 24)" \
  host="db-postgresql.database.svc.cluster.local" \
  port="5432" \
  database="app_db" \
  sslmode="require"

vault kv put secret/application/api \
  api_key="$(openssl rand -hex 32)" \
  endpoint="https://api.easyshop.internal"

vault kv put secret/application/redis \
  host="redis-master.database.svc.cluster.local" \
  port="6379" \
  password="$(openssl rand -base64 24)"

# Enable approle auth for non-k8s services
vault auth enable approle
vault write auth/approle/role/app-role \
  token_ttl=1h \
  token_max_ttl=4h \
  token_policies=application

# Create a periodic token for automation tasks with defined policy
vault token create -policy=application -period=24h -display-name="automation-token"

echo "Vault setup complete!"
echo ""
echo "Production Setup Recommendations:"
echo "--------------------------------"
echo "1. Store the unseal keys and root token in a secure hardware security module (HSM)"
echo "2. Set up auto-unsealing with AWS KMS for high availability"
echo "3. Configure Vault for high availability with multiple nodes"
echo "4. Implement regular backups of Vault data"
echo "5. Set up monitoring and alerting for Vault"
echo "6. Rotate root credentials and encryption keys regularly"
echo "7. Audit Vault access logs for security incidents"
echo ""
echo "For more information, see the documentation at README.md" 