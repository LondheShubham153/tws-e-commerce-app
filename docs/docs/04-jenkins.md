# Jenkins CI/CD Pipeline Setup Guide

This guide provides step-by-step instructions for setting up a Jenkins CI/CD pipeline for the EasyShop application, including GitHub webhook configuration and shared library integration.

## Table of Contents
- [Jenkins CI/CD Pipeline Setup Guide](#jenkins-cicd-pipeline-setup-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Jenkins Installation](#jenkins-installation)
    - [Verify Jenkins Service](#verify-jenkins-service)
    - [Start Jenkins (If Not Running)](#start-jenkins-if-not-running)
    - [Access Jenkins in Browser](#access-jenkins-in-browser)
  - [Jenkins Configuration](#jenkins-configuration)
    - [1. Initial Setup](#1-initial-setup)
    - [2. Required Plugins](#2-required-plugins)
    - [3. Credentials Setup](#3-credentials-setup)
    - [4. Email Notifications](#4-email-notifications)
  - [GitHub Webhook Setup](#github-webhook-setup)
    - [1. Generate GitHub Token](#1-generate-github-token)
    - [2. Configure GitHub in Jenkins](#2-configure-github-in-jenkins)
    - [3. Setup Webhook](#3-setup-webhook)
    - [4. Configure SonarQube](#4-configure-sonarqube)
  - [Pipeline Configuration](#pipeline-configuration)
    - [1. Create Pipeline](#1-create-pipeline)
    - [2. Shared Library Integration](#2-shared-library-integration)
    - [3. Pipeline Stages](#3-pipeline-stages)
    - [Logs Location](#logs-location)
  - [References](#references)

## Prerequisites

- Ubuntu 22.04 LTS server
- Jenkins installed
- Docker installed
- Git installed
- GitHub account
- Docker Hub account

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

### Verify Jenkins Service
First, check if the Jenkins service is running:

```bash
sudo systemctl status jenkins
```

### Start Jenkins (If Not Running)
If Jenkins is not running, start it with:

```bash
sudo systemctl enable jenkins
sudo systemctl restart jenkins
```

### Access Jenkins in Browser
Open your browser and navigate to:

## Jenkins Configuration

### 1. Initial Setup

1. Get the initial admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

2. Access Jenkins:
- Open `http://your-server-ip:8080`
- Enter the initial admin password
- Install suggested plugins
- Create admin user

### 2. Required Plugins

Install these plugins via "Manage Jenkins" > "Manage Plugins" > "Available":
- Docker Pipeline
- Email Extension Plugin
- GitHub Integration Plugin
- Pipeline Utility Steps
- SonarQube Scanner

### 3. Credentials Setup

1. Navigate to "Manage Jenkins" > "Manage Credentials"
2. Add Docker Hub credentials:
   - Kind: Username with password
   - Scope: Global
   - ID: docker-hub-credentials
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password

### 4. Email Notifications

1. Go to "Manage Jenkins" > "Configure System"
2. Configure E-mail Notification:
   - SMTP server: smtp.gmail.com
   - Use SMTP Authentication: Yes
   - User Name: Your email
   - Password: Your app password
   - Use SSL: Yes
   - SMTP Port: 465

## GitHub Webhook Setup

### 1. Generate GitHub Token

1. Go to GitHub.com > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scopes:
   - repo (all)
   - admin:repo_hook
4. Save the token

### 2. Configure GitHub in Jenkins

1. Add GitHub token to Jenkins credentials:
   - Kind: Secret text
   - Scope: Global
   - ID: github-token
   - Description: GitHub Token

### 3. Setup Webhook

1. In your GitHub repository:
   - Go to Settings > Webhooks
   - Add webhook
   - Payload URL: `http://your-jenkins-url:8080/github-webhook/`
   - Content type: application/json
   - Select: Just the push event

### 4. Configure SonarQube

1. Make sure docker is Running
   ```powershell
   sudo systemctl start docker
   sudo systemctl enable docker
   ```
2. Run SonarQube
   ```powershell
   docker run -d -p 9000:9000 --name sonarqubesonarqube:lts-community
   ```
3. Default Passwords
   ```powershell
   username: admin
   password: admin
   ```
4. Go to **Administration** and hover **Security** click on **Users**
5. See the 3 dots beside the user, click them
6. Create a Security Code and Copy it.
7. Open Jenkins Credentials and create new **Secret Text**
8. Copy it there with name of `sonarQubeToken`.

If you want a full guide headover to my Blog: [Jenkins Integreation with SonarQube](https://iamabdullah.hashnode.dev/integrating-jenkins-with-sonarqube-masterclass)

## Pipeline Configuration

### 1. Create Pipeline

1. Click "New Item"
2. Enter name: "easyshop-pipeline"
3. Select "Pipeline"
4. Configure:
   - GitHub project URL
   - Build Triggers: GitHub hook trigger for GITScm polling
   - Pipeline script from SCM
   - Git repository URL
   - Branch: */main
   - Script Path: Jenkinsfile

### 2. Shared Library Integration

Our pipeline uses a shared library from: [EasyShop Jenkins Shared Library](https://github.com/Abdullah-0-3/sharedLibJenkins.git/)

1. Go to "Manage Jenkins" > "Configure System"
2. Under "Global Pipeline Libraries":
   - Name: jenkinsLibrary
   - Default version: main
   - Modern SCM: GitHub
   - Repository URL: https://github.com/iemafzalhassan/EasyShop-jenkins-shared-lib.git

### 3. Pipeline Stages

Our pipeline includes these stages:
1. Checkout: Cleans workspace and checks out code
2. Build Docker Images: Builds application containers
3. Push to Docker Hub: Pushes images to registry
4. Deploy to Production: Deploys the application
5. Email Notification: Sends build status

### Logs Location

Important log locations:
- Jenkins logs: `/var/log/jenkins/jenkins.log`
- Docker logs: `docker logs container-name`
- Build logs: Available in Jenkins job console output


## References

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks Guide](https://docs.github.com/en/webhooks)
- [EasyShop Shared Library](https://github.com/iemafzalhassan/EasyShop-jenkins-shared-lib)
