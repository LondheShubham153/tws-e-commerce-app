# Prerequisites for EasyShop Deployment

This guide covers the essential tools and configurations needed before deploying the EasyShop application.

## Required Tools

### 1. Terraform

Terraform is used for infrastructure as code to provision and manage AWS resources.

#### Installation Steps

**For Windows:**
1. Download the appropriate Terraform package from [Terraform Downloads](https://www.terraform.io/downloads.html)
2. Extract the package to a directory of your choice
3. Add the directory to your system's PATH

**For macOS:**
```bash
brew install terraform
```

**For Linux:**
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

#### Verify Installation

```bash
terraform --version
```

### 2. AWS CLI

The AWS Command Line Interface is essential for interacting with AWS services.

#### Installation Steps

**For Windows:**
1. Download the AWS CLI MSI installer from [AWS CLI Download](https://aws.amazon.com/cli/)
2. Run the downloaded MSI installer and follow the on-screen instructions

**For macOS:**
```bash
brew install awscli
```

**For Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### Configure AWS CLI

After installation, configure the AWS CLI with your credentials:

```bash
aws configure
```

You will be prompted to enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name (e.g., eu-west-1)
- Default output format (json recommended)

### 3. Docker

Docker is required for containerization of the application.

#### Installation Steps

**For Windows/Mac:**
Download and install Docker Desktop from [Docker website](https://www.docker.com/products/docker-desktop)

**For Linux:**
```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

#### Verify Installation

```bash
docker --version
```

### 4. kubectl

Kubectl is the command-line tool for interacting with Kubernetes clusters.

#### Installation Steps

**For Windows:**
```bash
curl -LO "https://dl.k8s.io/release/v1.27.0/bin/windows/amd64/kubectl.exe"
```
Add the binary to your PATH.

**For macOS:**
```bash
brew install kubectl
```

**For Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

#### Verify Installation

```bash
kubectl version --client
```

### 5. Helm

Helm is the package manager for Kubernetes.

#### Installation Steps

**For Windows:**
```bash
choco install kubernetes-helm
```

**For macOS:**
```bash
brew install helm
```

**For Linux:**
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

#### Verify Installation

```bash
helm version
```

## AWS Account Setup

### 1. IAM User Creation

1. Log in to the AWS Management Console
2. Navigate to IAM service
3. Create a new user with programmatic access
4. Attach the necessary policies:
   - AmazonECR-FullAccess
   - AmazonEKSClusterPolicy
   - AmazonEKSServicePolicy
   - AmazonVPCFullAccess
5. Save the Access Key ID and Secret Access Key for AWS CLI configuration

### 2. Configure AWS CLI with IAM Credentials

```bash
aws configure
```

Enter the saved Access Key ID and Secret Access Key.

## GitHub Account Setup

### 1. Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create a new token with repo, admin:repo_hook, and workflow permissions
3. Save this token to use with Jenkins

### 2. Fork Required Repositories

1. Fork the EasyShop repository: https://github.com/USERNAME/tws-e-commerce-app
2. Fork the Jenkins Shared Libraries repository: https://github.com/USERNAME/jenkins-shared-libraries

## Next Steps

Once you have the prerequisites set up, you can proceed to:

1. [Jenkins CI/CD setup](./04-jenkins.md)
2. [Kubernetes deployment](./05-deployment.md)

## Troubleshooting

### Common Issues

1. **Terraform initialization fails**:
   - Ensure you have proper AWS credentials configured
   - Check network connectivity

2. **AWS CLI authentication issues**:
   - Verify your Access Key and Secret Access Key
   - Check if IAM user has the necessary permissions

3. **Docker permission errors on Linux**:
   - Run `sudo usermod -aG docker $USER`
   - Log out and log back in for changes to take effect