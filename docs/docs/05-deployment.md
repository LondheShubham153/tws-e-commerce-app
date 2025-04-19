# Continuous Deployment with ArgoCD

This guide will walk you through setting up continuous deployment using ArgoCD for the EasyShop application on Kubernetes.

## Prerequisites

Before configuring CD, make sure the following tools are installed on your Bastion server:

- kubectl
- AWS CLI
- Helm (will be used for Nginx ingress and cert-manager)

## Initial Setup

### SSH into Bastion Server

Connect to your Bastion EC2 instance via SSH:

```bash
ssh -i your-key.pem ec2-user@your-bastion-ip
```

> **Note:** This is not the node where Jenkins is running. This is the intermediate EC2 (Bastion Host) used for accessing private resources like your EKS cluster.

### Configure AWS CLI

Run the AWS configure command:

```bash
aws configure
```

Add your Access Key and Secret Key when prompted.

### Update Kubeconfig for EKS

Run the following command to connect to your EKS cluster:

```bash
aws eks update-kubeconfig --region eu-west-1 --name tws-eks-cluster
```

This command maps your EKS cluster with your Bastion server and enables communication with EKS components.

### Install Helm (if not already installed)

If Helm is not already installed on your Bastion server, install it with:

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
rm get_helm.sh
```

Verify the installation:

```bash
helm version
```

## ArgoCD Installation

You can install ArgoCD using either Kubernetes manifests or Helm. Choose the method that suits your preferences and requirements.

<details>
<summary><b>Option 1: Install ArgoCD using Manifests</b></summary>

### Create ArgoCD Namespace

```bash
kubectl create namespace argocd
```

### Install ArgoCD

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Monitor Pod Creation

```bash
watch kubectl get pods -n argocd
```

Wait until all pods are in the Running state.

### Configure ArgoCD Service

Check ArgoCD services:

```bash
kubectl get svc -n argocd
```

Change ArgoCD Server service to NodePort for external access:

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

</details>

<details>
<summary><b>Option 2: Install ArgoCD using Helm</b></summary>

### Add ArgoCD Helm Repository

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

### Create ArgoCD Namespace

```bash
kubectl create namespace argocd
```

### Install ArgoCD using Helm

```bash
helm install argocd argo/argo-cd \
  --namespace argocd \
  --set server.service.type=NodePort
```

### Monitor Pod Creation

```bash
watch kubectl get pods -n argocd
```

Wait until all pods are in the Running state.

### Check ArgoCD Service

Verify the ArgoCD service is properly configured:

```bash
kubectl get svc -n argocd
```

</details>

## Accessing ArgoCD

### Port Forward for Web Access

Run this command to access ArgoCD GUI from your local machine:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=0.0.0.0 &
```

You can now access the ArgoCD web interface at:
