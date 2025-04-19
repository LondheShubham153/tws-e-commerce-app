#!/bin/bash
set -e

# Update system and install dependencies
apt-get update
apt-get upgrade -y
apt-get install -y jq unzip wget curl software-properties-common awscli

# Install Prometheus Node Exporter for metrics collection
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz
mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
useradd -rs /bin/false node_exporter

# Create systemd service for Node Exporter
cat > /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|run)($|/)

[Install]
WantedBy=multi-user.target
EOF

# Enable and start Node Exporter
systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

# Install Promtail for log collection to Loki
mkdir -p /opt/promtail
wget https://github.com/grafana/loki/releases/download/v2.9.2/promtail-linux-amd64.zip
unzip promtail-linux-amd64.zip -d /opt/promtail
chmod +x /opt/promtail/promtail-linux-amd64

# Configure Promtail
cat > /opt/promtail/promtail-config.yaml <<EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /opt/promtail/positions.yaml

clients:
  - url: http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push

scrape_configs:
  - job_name: vault_logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: vault
          host: ${node_name}
          __path__: /var/log/vault/*.log
EOF

# Create systemd service for Promtail
cat > /etc/systemd/system/promtail.service <<EOF
[Unit]
Description=Promtail service for sending logs to Loki
After=network.target

[Service]
Type=simple
ExecStart=/opt/promtail/promtail-linux-amd64 -config.file /opt/promtail/promtail-config.yaml
Restart=always
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

# Enable and start Promtail
systemctl daemon-reload
systemctl enable promtail
systemctl start promtail

# Install HashiCorp Vault
curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
apt-get update
apt-get install -y vault

# Create Vault directories with proper permissions
mkdir -p /opt/vault/data
mkdir -p /etc/vault.d
chmod 750 /opt/vault/data
chown -R vault:vault /opt/vault
mkdir -p /var/log/vault
chown -R vault:vault /var/log/vault
chmod 755 /var/log/vault

# Get instance metadata
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
PRIVATE_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/local-ipv4)

# Write Vault server configuration
cat > /etc/vault.d/vault.hcl <<EOF
# Main Vault configuration file
ui = true
disable_mlock = true

# High availability cluster configuration
cluster_name = "${cluster_name}"
cluster_addr = "https://$PRIVATE_IP:8201"
api_addr = "https://$PRIVATE_IP:8200"

# Storage configuration - Use integrated storage (Raft) for HA
storage "raft" {
  path    = "/opt/vault/data"
  node_id = "${node_name}"
  
  retry_join {
    auto_join = "provider=aws region=${aws_region} tag_key=${cluster_tag_key} tag_value=${cluster_tag_value}"
    auto_join_scheme = "https"
    leader_tls_servername = "${cluster_name}.vault"
  }
}

# TCP listener for client connections
listener "tcp" {
  address            = "0.0.0.0:8200"
  cluster_address    = "0.0.0.0:8201"
  tls_disable        = "false"
  tls_cert_file      = "/opt/vault/tls/vault.crt"
  tls_key_file       = "/opt/vault/tls/vault.key"
  tls_min_version    = "tls12"
  telemetry {
    prometheus_retention_time = "30s"
    disable_hostname          = true
  }
}

# AWS KMS auto-unseal configuration
seal "awskms" {
  region     = "${aws_region}"
  kms_key_id = "${kms_key_id}"
}

# Telemetry configuration for Prometheus metrics
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}

# Configure logging
log_level = "info"
log_file = "/var/log/vault/vault.log"
EOF

# Create self-signed TLS certificate for Vault
mkdir -p /opt/vault/tls
chmod 750 /opt/vault/tls
chown -R vault:vault /opt/vault/tls

# Create a private key
openssl genrsa -out /opt/vault/tls/vault.key 4096
chmod 600 /opt/vault/tls/vault.key
chown vault:vault /opt/vault/tls/vault.key

# Create a certificate signing request
cat > /opt/vault/tls/openssl.cnf << EOF
[req]
default_bits = 4096
default_md = sha256
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = California
L = San Francisco
O = EasyShop
OU = DevOps
CN = ${node_name}.vault.${aws_region}.internal

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${node_name}.vault.${aws_region}.internal
DNS.2 = *.${cluster_name}.vault
DNS.3 = *.vault.${aws_region}.internal
DNS.4 = vault.service.${aws_region}.internal
IP.1 = $PRIVATE_IP
EOF

# Generate a self-signed certificate
openssl req -new -x509 -sha256 -nodes -days 3650 \
  -key /opt/vault/tls/vault.key \
  -out /opt/vault/tls/vault.crt \
  -config /opt/vault/tls/openssl.cnf

chmod 644 /opt/vault/tls/vault.crt
chown vault:vault /opt/vault/tls/vault.crt

# Set appropriate permissions for Vault configuration
chmod 640 /etc/vault.d/vault.hcl
chown -R vault:vault /etc/vault.d

# Enable and start Vault service
systemctl enable vault
systemctl start vault

# Wait for Vault service to start
sleep 10
systemctl status vault

# Add the Vault binary to root's PATH
echo "export VAULT_ADDR=https://127.0.0.1:8200" >> /root/.bashrc
echo "export VAULT_SKIP_VERIFY=true" >> /root/.bashrc

# Create a helper script for initialization
cat > /root/init-vault.sh << 'EOF'
#!/bin/bash
# Use this script to initialize Vault once the cluster is ready
# This should only be run on ONE node in the cluster

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true

# Check Vault status
INIT_STATUS=$(vault status -format=json 2>/dev/null | jq -r '.initialized' 2>/dev/null)

if [ "$INIT_STATUS" = "false" ]; then
  echo "Initializing Vault..."
  vault operator init -key-shares=5 -key-threshold=3 -format=json > /root/vault-init.json
  chmod 600 /root/vault-init.json
  echo "Vault initialized. Keys stored in /root/vault-init.json"
  echo "KEEP THIS SECURE! Consider using AWS SSM Parameter Store for production environments."
  
  # Extract root token and unseal keys
  ROOT_TOKEN=$(cat /root/vault-init.json | jq -r '.root_token')
  UNSEAL_KEY_1=$(cat /root/vault-init.json | jq -r '.unseal_keys_b64[0]')
  UNSEAL_KEY_2=$(cat /root/vault-init.json | jq -r '.unseal_keys_b64[1]')
  UNSEAL_KEY_3=$(cat /root/vault-init.json | jq -r '.unseal_keys_b64[2]')
  
  # Unseal Vault
  vault operator unseal $UNSEAL_KEY_1
  vault operator unseal $UNSEAL_KEY_2
  vault operator unseal $UNSEAL_KEY_3
  
  echo "Vault unsealed. You can now use Vault with the root token."
else
  echo "Vault is already initialized."
fi
EOF

chmod +x /root/init-vault.sh

echo "Vault Server setup completed successfully!"