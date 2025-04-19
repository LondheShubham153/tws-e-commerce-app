
# 🛍️ EasyShop - Modern E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.1.1-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux-2.2.1-purple?style=flat-square&logo=redux)](https://redux.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**EasyShop** is a modern, full-stack e-commerce platform built using Next.js, TypeScript, MongoDB, and Redux. It features a responsive UI, secure authentication, real-time cart updates, and a seamless shopping experience.

## ✨ Features
- 🎨 **Modern UI:** Responsive design with dark/light mode
- 🔐 **Secure Authentication:** JWT-based authentication for user security
- 🛒 **Real-time Cart:** Cart updates in real-time with Redux
- 📱 **Mobile-First Design:** Fully responsive for all device sizes
- 🔍 **Product Search & Filtering:** Easily find products through an intuitive search
- 💳 **Secure Checkout:** Safe and smooth checkout process
- 📦 **Categorized Products:** Browse products by categories
- 👤 **User Profile:** User profiles with order history

---

## 🏗️ Architecture Overview

### 1. Presentation Layer
- **Next.js 14** (App Router)
- **Redux** for state management
- **Tailwind CSS** for styling

### 2. Application Layer
- **Next.js API Routes** for backend logic
- **Authentication & Authorization** mechanisms
- Business logic and error handling

### 3. Data Layer
- **MongoDB** for database management
- **Mongoose** ODM for schema modeling

![Architecture Diagram](architecture_diagram.png)

![architecture_diagram](https://github.com/user-attachments/assets/88573b56-1ffc-493e-b6c6-4063aba888fe)

---

## 🧰 Prerequisites

Ensure the following tools are installed:
- Terraform
- AWS CLI
- kubectl
- Docker
- Helm

---

## 🚀 Infrastructure Setup (Terraform + AWS)

### 1. Install Terraform
```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

### 2. Install AWS CLI
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip
unzip awscliv2.zip
sudo ./aws/install
aws configure
```

### 3. Clone the Repo
```bash
git clone https://github.com/<your-username>/tws-e-commerce-app.git
cd terraform
```

### 4. Generate SSH Key for EC2 Access
```bash
ssh-keygen -f terra-key
chmod 400 terra-key
```

### 5. Deploy Infrastructure
```bash
terraform init
terraform plan
terraform apply
```

### 6. SSH Into EC2
```bash
ssh -i terra-key ubuntu@<public-ip>
```

---

## ⚙️ Jenkins Setup (CI)

### 1. Install Jenkins
```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
# Visit: http://<public-ip>:8080
```

### 2. Get Jenkins Admin Password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 3. Install Plugins
- Docker Pipeline
- Pipeline View

### 4. Add Global Credentials
- GitHub (ID: github-credentials)
- DockerHub (ID: docker-hub-credentials)

### 5. Setup Shared Library
- Path: Jenkins → Manage Jenkins → Configure System → Global Pipeline Libraries
- Name: shared
- Repo: https://github.com/<your-user>/jenkins-shared-libraries
- Default Version: main

### 6. Create Jenkins Pipeline
- Name: EasyShop
- Type: Pipeline
- Use Pipeline Script from SCM
- Git URL: https://github.com/<your-user>/tws-e-commerce-app
- Credentials: github-credentials
- Script Path: Jenkinsfile

### 7. GitHub Webhook
- Add webhook in GitHub to your Jenkins `/github-webhook/` endpoint

---

## 🚢 Argo CD Setup (CD)

### 1. Configure AWS CLI & Kubeconfig on Bastion
```bash
aws configure
aws eks --region eu-west-1 update-kubeconfig --name tws-eks-cluster
```

### 2. Install Argo CD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
watch kubectl get pods -n argocd
```

### 3. Patch ArgoCD Service to NodePort
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
kubectl get svc -n argocd
```

### 4. Access ArgoCD
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=0.0.0.0 &
# Visit: https://<bastion-ip>:8080
```

### 5. Get ArgoCD Admin Password
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## 🌐 NGINX Ingress Setup
```bash
kubectl create namespace ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer
kubectl get svc -n ingress-nginx
```

---

## 🔐 Cert-Manager + HTTPS Setup

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

### 2. Configure DNS
```bash
kubectl get svc nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Go to your DNS provider (e.g., GoDaddy) and create a CNAME or A record pointing to this hostname.

---

## 📦 Deploy to ArgoCD

### 1. In Argo CD GUI:
- Name: easyshop
- Project: default
- Sync Policy: Automatic

### 2. Source Section:
- Repo URL: https://github.com/<your-user>/tws-e-commerce-app
- Path: Kubernetes

### 3. Destination:
- Cluster URL: https://kubernetes.default.svc
- Namespace: easyshop

Click "Create" and monitor deployment.

---

## ✅ Final Touch
- Validate Ingress Route: Access the app via https://your-domain.com
- Check TLS Certificates: Confirm that Cert-Manager is managing your HTTPS setup
- ArgoCD Sync: Ensure ArgoCD reflects the current Git state

---

## 📃 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Contributing
Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit a pull request.
