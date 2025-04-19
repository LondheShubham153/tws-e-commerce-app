# 🛍️ EasyShop - Modern E-commerce Platform + DevOps Deployment

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.1.1-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux-2.2.1-purple?style=flat-square&logo=redux)](https://redux.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

EasyShop is a modern, full-stack e-commerce platform built with Next.js 14, TypeScript, MongoDB, and deployed with a production-ready DevOps stack featuring Jenkins, Terraform, ArgoCD, and Kubernetes (EKS).

---

## ✨ Frontend Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 Secure JWT-based Auth (NextAuth)
- 🛒 Real-time Redux-powered Cart
- 🔍 Product Search & Filters
- 📱 Mobile-first & Dark Mode
- 💳 Secure Checkout
- 👤 User Profiles & Order History

---

## ⚙️ DevOps Architecture (Production)

```mermaid
graph LR
  A[GitHub Repo] --> B[Jenkins CI]
  B --> C[Git Update: Manifest]
  C --> D[ArgoCD (GitOps)]
  D --> E[EKS Cluster]
  E --> F[EasyShop App]
  E --> G[Prometheus & Grafana]


🔧 Tools & Stack
Terraform – Infra as Code for Jenkins, EKS, IAM, VPC

Jenkins – CI for builds and GitOps updates

ArgoCD – GitOps-based CD to Kubernetes

Helm – Prometheus + Grafana monitoring

EKS – Highly available Kubernetes cluster

🚀 CI/CD + Monitoring Setup
1. Terraform: Provision Jenkins + EKS
cd terraform/
terraform init && terraform apply
2. Jenkins CI Pipeline
Pulls code

Builds Docker image

Updates manifest in Git

Pushes to ArgoCD Git repo

3. ArgoCD (CD)
kubectl create ns argocd
kubectl apply -n argocd -f kubernetes/argocd/install.yaml

4. Monitoring with Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

🔍 Summary of Deployment Challenges & Fixes
1. Jenkins Node Offline
Cause: Resource constraints (disk/swap/temp)

Fix: Increased disk space, enabled swap, restarted agent

2. Git Push Failures from Jenkins
Cause: Missing credentials, unset GIT_BRANCH

Fix: Injected credentials, verified remote + HEAD

3. Hardcoded sed in Manifest
Fix: Switched to a generic regex for image replacement

4. ArgoCD Sync Drift
Fix: Verified Git commits before sync, improved manifest update logic

💡 Learnings & Recommendations
✅ Use SHA/image tags over latest

🧪 Build Jenkins Shared Lib test harness

📈 Monitor Jenkins resource health

🔁 Prefer GitOps-first CI/CD: Jenkins → Git → ArgoCD → K8s

📦 Frontend Project Structure
csharp
Copy
Edit
easyshop/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Auth, DB, Redux
│   ├── types/            # TypeScript types
│   └── styles/           # Tailwind + global styles
├── public/              # Static assets
└── scripts/             # Migration, Docker, etc.
🐳 Local Development via Docker
bash
Copy
Edit
docker compose up -d
# Or manual steps (see original README above)
📫 Contact
Created & Maintained by Kedar
→ LinkedIn: linkedin.com/in/your-profile
→ Project: GitHub Repo

<div align="center"> <p>Made with ❤️ by Kedar — Empowering DevOps & Digital Commerce</p> </div> ```
