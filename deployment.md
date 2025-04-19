# EasyShop Deployment Guide

This comprehensive deployment guide outlines the step-by-step process for deploying the EasyShop e-commerce platform using modern DevOps practices and tools. This document provides detailed instructions for AWS cloud deployment with Kubernetes, CI/CD automation, and infrastructure as code.

## Table of Contents

- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Infrastructure Provisioning with Terraform](#infrastructure-provisioning-with-terraform)
- [Vault Setup and Configuration](#vault-setup-and-configuration)
- [Monitoring Stack Deployment](#monitoring-stack-deployment)
- [CI/CD Pipeline with Jenkins](#cicd-pipeline-with-jenkins)
- [Argo CD Setup for GitOps](#argo-cd-setup-for-gitops)
- [Application Deployment](#application-deployment)
- [HTTPS Setup](#https-setup)
- [Backup & Disaster Recovery](#backup--disaster-recovery)
- [Security Best Practices](#security-best-practices)
- [Maintenance Procedures](#maintenance-procedures)

## Project Structure

The EasyShop project has a clear separation between infrastructure code and application deployments:

```
.
├── src/                    # Application source code
├── terraform/              # Infrastructure as Code
│   ├── vpc.tf              # VPC and networking configuration
│   ├── eks.tf              # EKS cluster configuration
│   ├── vault.tf            # Vault infrastructure configuration
│   ├── variables.tf        # Variable definitions
│   ├── provider.tf         # Provider configuration
│   ├── ec2.tf              # EC2 instances configuration 
│   ├── outputs.tf          # Output values
│   ├── README.md           # Terraform documentation
│   └── templates/          # Template files for EC2 user data
│       └── vault_user_data.tpl # Vault server setup script
│
└── kubernetes/             # Kubernetes manifests
    ├── monitoring/         # Monitoring stack manifests
    │   ├── prometheus/     # Prometheus configuration
    │   ├── grafana/        # Grafana dashboards and configuration
    │   ├── alertmanager/   # Alertmanager configuration
    │   └── loki/           # Loki for log aggregation (future)
    ├── vault/              # Vault Kubernetes configuration
    └── applications/       # Application manifests
        ├── 00-namespace.yaml
        ├── 01-mongodb-pv.yaml
        ├── 02-mongodb-pvc.yaml
        ├── 03-configmap.yaml
        ├── 04-secrets.yaml
        ├── 05-mongodb-service.yaml
        ├── 06-mongodb-statefulset.yaml
        ├── 07-easyshop-deployment.yaml
        ├── 08-easyshop-service.yaml
        ├── 09-ingress.yaml
        └── 10-hpa.yaml
```

## Architecture Overview

EasyShop follows a microservices architecture deployed on AWS EKS (Elastic Kubernetes Service). The architecture includes:

- **Frontend**: Next.js application served from Kubernetes
- **Database**: MongoDB for persistent storage
- **API Layer**: Next.js API routes
- **CI/CD**: Jenkins for continuous integration and delivery
- **GitOps**: Argo CD for continuous deployment
- **Secret Management**: HashiCorp Vault with high availability
- **Monitoring**: Prometheus, Grafana, and Alertmanager
- **Infrastructure**: Managed via Terraform
- **Networking**: AWS VPC, subnets, and security groups
- **Load Balancing**: AWS ALB via Kubernetes Ingress

## Prerequisites

Before starting the deployment process, ensure you have:

1. **AWS Account** with appropriate permissions:
   - EC2, EKS, VPC, IAM, Route53, S3, DynamoDB, KMS

2. **Tools Installation**:
   - AWS CLI v2+
   - Terraform v1.5.0+
   - kubectl v1.20+
   - Git
   - Docker
   - Helm v3+

3. **Domain Name** (Optional but recommended for production)

## Infrastructure Provisioning with Terraform

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/easyshop.git
cd easyshop/terraform
```

### 2. Generate SSH Key Pair

```bash
ssh-keygen -f terra-key
chmod 400 terra-key
```

### 3. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region (e.g., ap-south-1), and output format
```

### 4. Initialize Terraform

```bash
terraform init
```

### 5. Review and Update Variables

Modify `terraform/variables.tf` to adjust settings according to your requirements:

```bash
# Example customization
terraform apply \
  -var="environment=prod" \
  -var="domain_name=easyshop.yourdomain.com" \
  -var="eks_node_group_min_size=3" \
  -var="eks_node_group_max_size=6"
```

### 6. Plan and Apply Infrastructure

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 7. Verify the Created Resources

After successful terraform apply, verify the created resources:

```bash
# List Terraform outputs
terraform output

# Check EKS cluster
aws eks list-clusters --region ap-south-1

# Verify EC2 instances
aws ec2 describe-instances --filters "Name=tag:Project,Values=easyshop" --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,Name:Tags[?Key=='Name'].Value|[0]}" --output table
```

### 8. Configure kubectl for EKS

```bash
aws eks --region ap-south-1 update-kubeconfig --name easyshop-eks-cluster
kubectl get nodes
```

## Vault Setup and Configuration

HashiCorp Vault is deployed using Terraform for the infrastructure and configured to run as a highly available cluster.

### 1. SSH to Bastion Host

```bash
ssh -i terra-key ubuntu@$(terraform output -raw bastion_public_ip)
```

### 2. Connect to Vault Server

```bash
ssh ec2-user@$(terraform output -raw vault_server_private_ips | jq -r '.[0]')
```

### 3. Initialize and Unseal Vault

```bash
# Run the initialization script
sudo /root/init-vault.sh

# Save the root token and unseal keys securely
cat /root/vault-init.json

# Configure environment
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_TOKEN=<root_token>
export VAULT_SKIP_VERIFY=true
```

### 4. Configure Vault for Kubernetes Integration

```bash
# Deploy Vault Kubernetes integration
kubectl apply -f kubernetes/vault/vault-config.yaml

# Verify deployment
kubectl get pods -n vault-system
```

### 5. Configure Secret Engines

```bash
# Enable KV secrets engine
vault secrets enable -path=secret kv-v2

# Store application secrets
vault kv put secret/application/database \
  username="dbuser" \
  password="securepassword" \
  database_name="easyshop"
```

## Monitoring Stack Deployment

Deploy the comprehensive monitoring stack with Prometheus, Grafana, and Alertmanager.

### 1. Create Monitoring Namespace

```bash
kubectl create namespace monitoring
```

### 2. Deploy Prometheus

```bash
kubectl apply -f kubernetes/monitoring/prometheus/prometheus-config.yaml
```

### 3. Deploy Alertmanager

```bash
kubectl apply -f kubernetes/monitoring/alertmanager/alertmanager-config.yaml
```

### 4. Deploy Grafana

```bash
kubectl apply -f kubernetes/monitoring/grafana/grafana-config.yaml
```

### 5. Verify Monitoring Components

```bash
kubectl get pods,svc -n monitoring
```

### 6. Access Monitoring UIs

```bash
# Port forward for testing (in production, use Ingress)
kubectl port-forward svc/grafana -n monitoring 3000:3000 --address=0.0.0.0 &
kubectl port-forward svc/prometheus -n monitoring 9090:9090 --address=0.0.0.0 &
kubectl port-forward svc/alertmanager -n monitoring 9093:9093 --address=0.0.0.0 &
```

Access Grafana at http://localhost:3000 with the credentials from the Kubernetes secrets (default: admin/easyshop).

### 7. Configure Alerting

Alertmanager is pre-configured with Slack and PagerDuty integrations. Update the configuration with your specific channels:

```bash
# Edit Alertmanager ConfigMap
kubectl edit configmap alertmanager-config -n monitoring
```

## CI/CD Pipeline with Jenkins

### 1. Connect to Jenkins Server

SSH into the EC2 instance where Jenkins is installed:

```bash
ssh -i terra-key ubuntu@<jenkins-ec2-public-ip>
```

### 2. Check Jenkins Status

```bash
sudo systemctl status jenkins

# If not running, start Jenkins
sudo systemctl enable jenkins
sudo systemctl restart jenkins
```

### 3. Set Up Jenkins Pipeline

1. Navigate to `http://<jenkins-public-ip>:8080` in your browser
2. Get initial admin password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install recommended plugins plus:
   - Docker Pipeline
   - Pipeline View
   - AWS SDK
   - Kubernetes CLI

### 4. Configure Jenkins Credentials

1. Add GitHub credentials:
   - Go to: `Jenkins → Manage Jenkins → Credentials → (Global) → Add Credentials`
   - Kind: Username with password
   - ID: github-credentials

2. Add DockerHub credentials:
   - Kind: Username with password
   - ID: docker-hub-credentials

3. Add AWS credentials:
   - Kind: AWS Credentials
   - ID: aws-credentials

### 5. Set Up Jenkins Shared Library

1. Go to `Jenkins → Manage Jenkins → Configure System`
2. Scroll to Global Pipeline Libraries section
3. Add a new shared library:
   - Name: shared
   - Default Version: main
   - Project Repository URL: `https://github.com/<your-username>/jenkins-shared-libraries`

### 6. Create Pipeline Job

1. Create new pipeline job
2. Configure GitHub repository
3. Set up webhook for automated builds
4. Configure the pipeline to use the Jenkinsfile from the repository:
   ```groovy
   // Example Jenkinsfile
   pipeline {
     agent { label 'docker' }
     environment {
       DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
       AWS_CREDENTIALS = credentials('aws-credentials')
       GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
     }
     stages {
       stage('Build') {
         steps {
           sh 'docker build -t username/easyshop:${GIT_COMMIT_SHORT} .'
         }
       }
       stage('Test') {
         steps {
           sh 'docker run username/easyshop:${GIT_COMMIT_SHORT} npm test'
         }
       }
       stage('Push') {
         steps {
           sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
           sh 'docker push username/easyshop:${GIT_COMMIT_SHORT}'
           sh 'docker tag username/easyshop:${GIT_COMMIT_SHORT} username/easyshop:latest'
           sh 'docker push username/easyshop:latest'
         }
       }
       stage('Update Manifest') {
         steps {
           sh 'aws eks update-kubeconfig --region ap-south-1 --name easyshop-eks-cluster'
           sh """
             sed -i 's|image: username/easyshop:.*|image: username/easyshop:${GIT_COMMIT_SHORT}|' kubernetes/applications/07-easyshop-deployment.yaml
             git config user.email 'jenkins@example.com'
             git config user.name 'Jenkins'
             git add kubernetes/applications/07-easyshop-deployment.yaml
             git commit -m 'Update image tag to ${GIT_COMMIT_SHORT}'
             git push origin main
           """
         }
       }
     }
   }
   ```

## Argo CD Setup for GitOps

### 1. Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2. Access Argo CD UI

```bash
# Change service type to NodePort for access
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Port forward for secure access
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=0.0.0.0 &
```

### 3. Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

### 4. Set Up Argo CD Application

1. Log in to Argo CD UI (https://<bastion-ip>:8080)
2. Add new application:
   - Application Name: easyshop
   - Project: default
   - Sync Policy: Automatic
   - Repository URL: https://github.com/<your-username>/easyshop
   - Path: kubernetes/applications
   - Cluster: https://kubernetes.default.svc
   - Namespace: easyshop

3. Set up other applications for monitoring:
   - Application Name: monitoring
   - Path: kubernetes/monitoring
   - Namespace: monitoring

### 5. Sync Applications

Click "Sync" in the Argo CD UI to deploy all applications.

## Application Deployment

### 1. Prepare EasyShop Namespace and Resources

The namespace and resources will be created automatically by Argo CD. To manually apply them:

```bash
kubectl apply -f kubernetes/applications/00-namespace.yaml
```

### 2. Deploy MongoDB

```bash
kubectl apply -f kubernetes/applications/01-mongodb-pv.yaml
kubectl apply -f kubernetes/applications/02-mongodb-pvc.yaml
kubectl apply -f kubernetes/applications/05-mongodb-service.yaml
kubectl apply -f kubernetes/applications/06-mongodb-statefulset.yaml
```

### 3. Configure ConfigMaps and Secrets

```bash
kubectl apply -f kubernetes/applications/03-configmap.yaml
kubectl apply -f kubernetes/applications/04-secrets.yaml
```

### 4. Deploy EasyShop Application

```bash
kubectl apply -f kubernetes/applications/07-easyshop-deployment.yaml
kubectl apply -f kubernetes/applications/08-easyshop-service.yaml
```

### 5. Set Up Ingress Controller

```bash
kubectl create namespace ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer
```

### 6. Deploy Ingress Resource

```bash
kubectl apply -f kubernetes/applications/09-ingress.yaml
```

### 7. Configure Horizontal Pod Autoscaler

```bash
kubectl apply -f kubernetes/applications/10-hpa.yaml
```

### 8. Verify Deployment

```bash
kubectl get all -n easyshop
kubectl get ingress -n easyshop
```

## HTTPS Setup

### 1. Install Cert-Manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true
```

### 2. Create Cluster Issuer

Create a file named `cluster-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

Apply it:

```bash
kubectl apply -f cluster-issuer.yaml
```

### 3. Update Ingress for HTTPS

Update the ingress resource to include TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: easyshop-ingress
  namespace: easyshop
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - easyshop.yourdomain.com
    secretName: easyshop-tls
  rules:
  - host: easyshop.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: easyshop-service
            port:
              number: 80
```

### 4. Verify HTTPS

Check certificate status:

```bash
kubectl get certificate -n easyshop
kubectl describe certificate easyshop-tls -n easyshop
```

## Backup & Disaster Recovery

### 1. MongoDB Backups

Set up a CronJob for regular MongoDB backups:

```bash
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: easyshop
spec:
  schedule: "0 1 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mongodb-backup
            image: mongo:4.4
            command:
            - /bin/sh
            - -c
            - |
              mongodump --host=mongodb-service --port=27017 --out=/backup/\$(date +%Y%m%d) && \
              tar czf /backup/mongodb-backup-\$(date +%Y%m%d).tar.gz /backup/\$(date +%Y%m%d) && \
              aws s3 cp /backup/mongodb-backup-\$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            emptyDir: {}
          restartPolicy: OnFailure
EOF
```

### 2. Vault Backups

Schedule regular snapshots of Vault's Raft storage:

```bash
ssh -i terra-key ubuntu@$(terraform output -raw bastion_public_ip)
ssh ec2-user@$(terraform output -raw vault_server_private_ips | jq -r '.[0]')

# Execute Vault snapshot
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_TOKEN=<root_token>
export VAULT_SKIP_VERIFY=true

vault operator raft snapshot save snapshot.bak
aws s3 cp snapshot.bak s3://your-backup-bucket/vault/$(date +%Y%m%d)-snapshot.bak
```

### 3. Disaster Recovery Plan

Document steps for disaster recovery:

1. **Infrastructure Recreation**:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

2. **Vault Restoration**:
   ```bash
   # Download the latest snapshot
   aws s3 cp s3://your-backup-bucket/vault/latest-snapshot.bak .
   
   # Restore the snapshot
   vault operator raft snapshot restore snapshot.bak
   ```

3. **Database Restoration**:
   ```bash
   # Download the latest backup
   aws s3 cp s3://your-backup-bucket/latest-mongodb-backup.tar.gz .
   
   # Restore the MongoDB backup
   kubectl exec -it mongodb-0 -n easyshop -- mongorestore --drop /path/to/backup
   ```

4. **DNS Reconfiguration**:
   - Update DNS records to point to new load balancer endpoints

## Security Best Practices

### 1. Network Security

- Use Kubernetes Network Policies to restrict pod-to-pod communication:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-network-policy
  namespace: easyshop
spec:
  podSelector:
    matchLabels:
      app: mongodb
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: easyshop
    ports:
    - protocol: TCP
      port: 27017
```

- Use private subnets for nodes and databases
- Properly configure security groups in AWS

### 2. Pod Security

Apply Pod Security Standards:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: easyshop
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
EOF
```

### 3. Secret Management

- Use Vault for secret management instead of Kubernetes secrets
- Rotate secrets regularly (at least every 90 days)
- Enable audit logging for Vault

### 4. Regular Updates

Keep all components updated:
- EKS version
- Node AMIs
- Application dependencies
- Container images

## Maintenance Procedures

### 1. Node Upgrades

To upgrade worker nodes:

```bash
# Update node group via Terraform
cd terraform
terraform apply -var="eks_node_group_version=1.27"
```

### 2. Kubernetes Version Upgrades

Follow AWS documentation for EKS version upgrades:

1. Upgrade control plane:
   ```bash
   aws eks update-cluster-version --name easyshop-eks-cluster --kubernetes-version 1.28
   ```

2. Upgrade add-ons:
   ```bash
   aws eks update-addon --cluster-name easyshop-eks-cluster --addon-name vpc-cni --addon-version v1.14.0-eksbuild.1
   aws eks update-addon --cluster-name easyshop-eks-cluster --addon-name kube-proxy --addon-version v1.28.1-eksbuild.1
   aws eks update-addon --cluster-name easyshop-eks-cluster --addon-name coredns --addon-version v1.10.1-eksbuild.1
   ```

3. Upgrade worker nodes:
   ```bash
   terraform apply -var="eks_version=1.28"
   ```

### 3. Application Updates

Application updates are handled automatically through the CI/CD pipeline:

1. Code changes are pushed to GitHub
2. Jenkins builds and tests new images
3. Jenkins updates the Kubernetes manifests with the new image tag
4. Argo CD detects changes and applies them

### 4. Database Maintenance

For MongoDB maintenance:

```bash
# Scale down application
kubectl scale deployment easyshop -n easyshop --replicas=0

# Perform maintenance
kubectl exec -it mongodb-0 -n easyshop -- mongo

# Scale application back up
kubectl scale deployment easyshop -n easyshop --replicas=2
```

## Conclusion

Following this deployment guide will establish a robust, scalable, and secure infrastructure for the EasyShop e-commerce platform on AWS EKS. The deployment leverages modern DevOps practices including infrastructure as code, CI/CD automation, GitOps, and comprehensive monitoring with Prometheus, Grafana, and Alertmanager.

For troubleshooting or additional assistance, consult the project documentation or reach out to the DevOps team. 