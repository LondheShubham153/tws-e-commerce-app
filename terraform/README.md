# EasyShop Production Infrastructure

This repository contains Terraform configuration for building a secure, production-ready AWS infrastructure for the EasyShop application. It follows AWS and Kubernetes best practices for security, high availability, and operational excellence.

## Architecture Overview

The infrastructure is deployed in AWS and includes:

- **Networking**: Multi-AZ VPC with public, private, and intra subnets
- **Kubernetes**: Amazon EKS for container orchestration
- **Secret Management**: HashiCorp Vault with high availability
- **Security**: KMS encryption, network security, secure IAM policies
- **Monitoring**: Prometheus, Grafana, and Loki for comprehensive monitoring and log aggregation

## Infrastructure Components

### VPC and Networking

- VPC with CIDR `10.0.0.0/16` spanning 3 Availability Zones
- Public subnets for internet-facing components (load balancers, bastion)
- Private subnets for application workloads
- Intra subnets for EKS control plane
- Network ACLs for subnet-level security
- VPC Flow Logs for network traffic monitoring
- One NAT Gateway per AZ for high availability

### Amazon EKS Cluster

- EKS version 1.28 with encryption enabled for secrets
- Private endpoints for internal access
- IAM Roles for Service Accounts (IRSA) for fine-grained permissions
- Node groups with different instance types optimized for workloads:
  - Application nodes: t3.large instances
  - Database nodes: r6i.xlarge instances with dedicated storage
- Automatic scaling with Cluster Autoscaler
- EBS CSI Driver for persistent storage
- AWS Load Balancer Controller for ingress traffic

### HashiCorp Vault

- High-availability cluster with Integrated Storage (Raft)
- Auto-unsealing with AWS KMS
- AWS IAM authentication and Kubernetes authentication
- Load balanced access via internal Application Load Balancer
- TLS encryption for all communications
- Integration with Prometheus for metrics and Loki for logs
- Secure secrets engines for various credential types:
  - KV v2 for generic secrets
  - Database credentials with PostgreSQL integration
  - AWS credentials with IAM policies
  - PKI for certificate issuance
  - Transit for encryption as a service

### Security Features

- All EBS volumes encrypted with KMS
- Secrets encryption for EKS control plane
- IMDSv2 required on all EC2 instances
- Network segmentation with security groups
- Private subnets for all workloads
- Bastion host with SSH access via IAM roles
- CloudTrail for API audit logging
- Certificate management with ACM
- IAM roles with least privilege
- Security groups with fine-grained rules

### Monitoring and Logging

- Prometheus for metrics collection
- Grafana for metrics visualization
- Loki for log aggregation
- Promtail for log collection
- Node Exporter for system-level metrics
- EKS control plane logging enabled
- Vault audit logging enabled
- Load balancer access logs stored in S3

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. Terraform v1.5.0 or newer
3. kubectl command-line tool
4. Helm v3
5. A domain name for DNS configuration (if using custom domains)

## Project Structure

```
.
├── terraform/             # Infrastructure as Code
│   ├── vpc.tf             # VPC and networking configuration
│   ├── eks.tf             # EKS cluster configuration
│   ├── vault.tf           # Vault infrastructure configuration
│   ├── variables.tf       # Variable definitions
│   ├── provider.tf        # Provider configuration
│   ├── ec2.tf             # EC2 instances configuration
│   ├── outputs.tf         # Output values
│   └── templates/         # Template files for EC2 user data
│       └── vault_user_data.tpl # Vault server setup script
│
└── kubernetes/            # Kubernetes manifests
    ├── monitoring/        # Monitoring stack (Prometheus, Grafana, Loki)
    ├── vault/             # Vault Kubernetes configuration
    └── applications/      # Application manifests
```

## Quick Start

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=tfplan

# Apply the configuration
terraform apply tfplan

# Configure kubectl to access the EKS cluster
aws eks --region ap-south-1 update-kubeconfig --name easyshop-eks-cluster
```

## Vault Initialization and Configuration

After deploying the infrastructure, follow these steps to initialize Vault:

1. SSH into the bastion host:
   ```bash
   ssh -i your-key.pem ec2-user@$(terraform output -raw bastion_public_ip)
   ```

2. Connect to one of the Vault servers:
   ```bash
   ssh ec2-user@$(terraform output -raw vault_server_private_ips | jq -r '.[0]')
   ```

3. Run the initialization script:
   ```bash
   sudo /root/init-vault.sh
   ```

4. Save the generated root token and unseal keys securely in a hardware security module or secure secret management system.

5. Configure Vault for EasyShop:
   ```bash
   # Set environment variables
   export VAULT_ADDR=https://127.0.0.1:8200
   export VAULT_TOKEN=<root_token>
   export VAULT_SKIP_VERIFY=true
   
   # Run the Vault setup script
   sudo ./vault-setup.sh
   ```

## Kubernetes Resources Deployment

After infrastructure provisioning, deploy Kubernetes resources separately from the `kubernetes/` directory:

1. First, deploy the monitoring stack:
   ```bash
   kubectl apply -f kubernetes/monitoring/namespace.yaml
   kubectl apply -f kubernetes/monitoring/prometheus/
   kubectl apply -f kubernetes/monitoring/grafana/
   kubectl apply -f kubernetes/monitoring/loki/
   ```

2. Deploy Vault Kubernetes integration:
   ```bash
   kubectl apply -f kubernetes/vault/
   ```

3. Deploy your applications with proper Vault integration:
   ```bash
   kubectl apply -f kubernetes/applications/
   ```

## Accessing Monitoring Tools

After deploying the Kubernetes resources:

1. Access Grafana dashboard:
   ```bash
   kubectl port-forward -n monitoring svc/grafana 3000:3000
   ```
   Then open http://localhost:3000 in your browser (default credentials: admin/admin)

2. Access Prometheus:
   ```bash
   kubectl port-forward -n monitoring svc/prometheus-server 9090:9090
   ```
   Then open http://localhost:9090 in your browser

## Operations

### Monitoring

The monitoring stack provides comprehensive observability:

- Prometheus for metrics collection and alerting
- Grafana for metrics visualization and dashboards
- Loki for log aggregation and searching
- Promtail for log collection from all nodes

### Backup and Disaster Recovery

- EKS cluster configuration is stored in Terraform state
- Vault data is stored in the Raft storage backend
- Regular snapshots of Vault data should be scheduled
- KMS keys have automatic rotation enabled
- EBS volumes can be backed up with AWS Backup

### Security Operations

1. Regularly rotate credentials:
   - AWS IAM access keys
   - Vault root token
   - Database credentials
   - Certificates

2. Review and monitor:
   - CloudTrail logs for suspicious activity
   - VPC Flow Logs for unexpected network traffic
   - Vault audit logs for unauthorized access attempts

3. Apply security updates regularly:
   - EKS version upgrades
   - Amazon Linux security patches
   - Container image updates

## Compliance

This infrastructure implementation helps meet compliance requirements for:

- SOC 2
- PCI DSS
- HIPAA (with additional controls)
- GDPR

## Production Considerations

Before deploying to production, consider:

1. **Custom Domain Name**: Replace `easyshop.internal` with your actual domain
2. **Certificate Management**: Use ACM for public-facing certificates
3. **Multi-Region Deployment**: For higher availability, consider multi-region deployment
4. **Cost Optimization**: Review instance sizes and adjust based on actual workload
5. **Scaling Limits**: Set appropriate scaling limits for node groups
6. **Backup Strategy**: Implement regular backups of critical data
7. **Alerting**: Configure Prometheus AlertManager for notifications

## Common Tasks

### Scaling Node Groups

```bash
# Edit terraform variables for desired sizes
terraform apply -var="eks_node_group_min_size=4" -var="eks_node_group_desired_size=5"
```

### Adding New Secrets to Vault

```bash
export VAULT_ADDR=https://vault.easyshop.internal
export VAULT_TOKEN=<your-token>

# Add a new API key
vault kv put secret/application/api-keys/new-service \
  api_key=$(openssl rand -hex 32) \
  environment=production
```

### Updating EKS Version

1. Update the `eks_version` variable in `variables.tf`
2. Run `terraform plan` to review the changes
3. Schedule a maintenance window for the update
4. Apply the changes: `terraform apply`

## Troubleshooting

- **Vault Sealed**: Use the unseal keys to unseal Vault
- **EKS Connection Issues**: Verify security groups and VPC networking
- **Application Can't Access Secrets**: Check Vault authentication and policies
- **Prometheus/Grafana Issues**: Check the Kubernetes deployments and persistent volumes

## License

This project is licensed under the terms specified in the LICENSE file.

## Contact

For issues or questions, contact the DevOps team at devops@easyshop.com

