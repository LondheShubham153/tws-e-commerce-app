# Jenkins CI/CD Pipeline for EasyShop

This directory contains the Jenkins pipeline configuration for the EasyShop e-commerce application, providing end-to-end automation from code commit to production deployment.

## Overview

The EasyShop CI/CD pipeline automates the following processes:
- Code quality verification and testing
- Container image building and security scanning
- Versioned artifacts management
- Infrastructure-as-Code updates
- Multi-environment deployment with verification

## Jenkins Installation

1. Add Jenkins repository key:
```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
    /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```

2. Add Jenkins repository:
```bash
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
    /etc/apt/sources.list.d/jenkins.list > /dev/null
```

3. Update package list and install Jenkins:
```bash
sudo apt update
sudo apt install jenkins
```

4. Start Jenkins service:
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

5. Get the initial admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

6. Access Jenkins at `http://your-server-ip:8080` and complete setup.

## Jenkinsfile

The `Jenkinsfile` in this directory defines the complete CI/CD pipeline using declarative pipeline syntax, making it easier to maintain and understand.

## Pipeline Structure

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Build & Test   │────▶│  Docker Images  │────▶│  Security Scan  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               ▼
┌─────────────────┐                          ┌─────────────────┐
│Update K8s Files │◀───────────────────────┤   Push Images   │
└─────────────────┘                          └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│     Deploy      │────▶│     Verify      │
└─────────────────┘     └─────────────────┘
```

## Pipeline Stages

1. **Cleanup Workspace** - Cleans the Jenkins workspace before starting
2. **Clone Repository** - Clones the application source code
3. **Static Code Analysis** - Runs SonarQube scan for code quality
4. **Run Unit Tests** - Executes unit tests and publishes reports
5. **Build Docker Images** - Builds application and migration Docker images
6. **Security Scan with Trivy** - Scans Docker images for vulnerabilities
7. **Quality Gate** - Verifies code quality meets standards
8. **Push Docker Images** - Pushes images to Docker Hub
9. **Update Kubernetes Manifests** - Updates Kubernetes deployment files with new image tags
10. **Deploy to Kubernetes** - Deploys the application using ArgoCD
11. **Verify Deployment** - Ensures the deployment is successful

## Environment-Based Deployments

The pipeline supports three deployment environments:
- **Development (dev)** - Runs on merge to `master`
  - Fewer automated tests
  - Relaxed quality gates
  - Automatic deployment
- **Staging** - Runs on merge to `staging` branch
  - Full test suite
  - Strict quality gates
  - Automatic deployment with approval
- **Production** - Runs on merge to `production` branch
  - Full test suite
  - Strict quality gates
  - Manual approval required
  - Blue/Green deployment strategy

## Prerequisites

### System Requirements
- Ubuntu 22.04 LTS server (recommended)
- Jenkins server (v2.346.x or later)
- Docker engine (v20.10.x or later)
- Kubernetes cluster (v1.23.x or later) 
- ArgoCD (v2.4.x or later)
- Git installed
- GitHub account
- Docker Hub account

### Required Jenkins Plugins
- Pipeline (v2.6.x or later)
- Docker Pipeline (v1.28.x or later)
- Git Integration (v4.11.x or later)
- Kubernetes CLI (v1.10.x or later)
- Slack Notification (v2.48.x or later)
- SonarQube Scanner (v2.14.x or later)
- JUnit (v1.53.x or later)
- Email Extension Plugin
- Pipeline Utility Steps

## Setting Up the Pipeline

### 1. Initial Jenkins Configuration

1. Install required plugins via "Manage Jenkins" > "Manage Plugins" > "Available"
2. Navigate to "Manage Jenkins" > "Configure System"
3. Configure Email Notification:
   - SMTP server: smtp.gmail.com
   - Use SMTP Authentication: Yes
   - User Name: Your email
   - Password: Your app password
   - Use SSL: Yes
   - SMTP Port: 465

### 2. GitHub Webhook Setup

1. Generate GitHub Token:
   - Go to GitHub.com > Settings > Developer settings > Personal access tokens
   - Generate new token with scopes: repo (all), admin:repo_hook
   - Save the token

2. Add GitHub token to Jenkins credentials:
   - Kind: Secret text
   - Scope: Global
   - ID: github-token
   - Description: GitHub Token

3. Setup Webhook in GitHub repository:
   - Go to Settings > Webhooks
   - Add webhook
   - Payload URL: `http://your-jenkins-url:8080/github-webhook/`
   - Content type: application/json
   - Select: Just the push event

### 3. Configure Jenkins Credentials

1. Navigate to "Manage Jenkins" > "Manage Credentials"
2. Add required credentials:
   - `github-credentials` - Credentials for GitHub
   - `docker-hub-credentials` - Credentials for Docker Hub
   - `sonarqube-token` - Token for SonarQube authentication
   - `argocd-credentials` - Credentials for ArgoCD 
   - `slack-token` - Token for Slack integration

### 4. Shared Library Integration

1. Go to "Manage Jenkins" > "Configure System"
2. Under "Global Pipeline Libraries":
   - Name: `easyshop-pipeline-lib`
   - Default version: `main`
   - Modern SCM: GitHub
   - Repository URL: https://github.com/iemafzalhassan/EasyShop-jenkins-shared-lib.git

### 5. Create Pipeline Job

1. Click "New Item"
2. Enter name: "easyshop-pipeline"
3. Select "Pipeline"
4. Configure:
   - GitHub project URL
   - Build Triggers: GitHub hook trigger for GITScm polling
   - Pipeline script from SCM
   - Git repository URL
   - Branch specifier: */master, */staging, */production
   - Script Path: jenkins/Jenkinsfile

## Pipeline Variables

The pipeline uses the following environment variables:

- `DOCKER_IMAGE_NAME` - Name of the main application Docker image
- `DOCKER_MIGRATION_IMAGE_NAME` - Name of the migration Docker image
- `DOCKER_IMAGE_TAG` - Tag for Docker images (branch-specific or build number)
- `GIT_BRANCH` - Current Git branch
- `DEPLOY_ENVIRONMENT` - Target deployment environment (dev/staging/prod)
- `SLACK_CHANNEL` - Slack channel for notifications

## Troubleshooting

### Common Issues

1. **Docker Build Failures**
   - Check Docker daemon is running on the Jenkins agent
   - Verify Docker Hub credentials are correct
   - Increase build timeout if timeouts occur

2. **Deployment Failures**
   - Verify kubectl context is correctly set
   - Check ArgoCD is properly configured
   - Examine Kubernetes cluster resources (events, logs)

3. **Test Failures**
   - Check test dependencies are installed
   - Ensure test environment variables are properly set
   - Review test logs for specific error messages

4. **GitHub Webhook Issues**
   - Verify webhook URL is accessible from GitHub
   - Check webhook payload format matches what Jenkins expects
   - Review GitHub webhook delivery logs in repository settings

### Important Log Locations

- Jenkins logs: `/var/log/jenkins/jenkins.log`
- Docker logs: `docker logs container-name`
- Build logs: Available in Jenkins job console output

### Pipeline Logs

The pipeline generates detailed logs at each stage. To examine them:
1. Navigate to the build in Jenkins UI
2. Select "Console Output" to view the full logs
3. Check stage-specific logs for targeted troubleshooting

## Best Practices

1. **Branch Management**
   - Use feature branches for all changes
   - Require pull request reviews before merges
   - Keep the master branch deployable at all times

2. **Pipeline Optimization**
   - Use Docker layer caching to speed up builds
   - Parallelize test execution where possible
   - Implement caching for dependencies

3. **Security**
   - Regularly update base Docker images
   - Address all critical and high security findings
   - Use secret management for sensitive data

4. **Monitoring**
   - Monitor pipeline execution times
   - Track test coverage and success rates
   - Set up alerts for pipeline failures

## References

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks Guide](https://docs.github.com/en/webhooks)
- [EasyShop Shared Library](https://github.com/iemafzalhassan/EasyShop-jenkins-shared-lib) 