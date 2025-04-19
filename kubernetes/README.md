# Kubernetes Manifests - EasyShop

This directory contains Kubernetes manifests for deploying the EasyShop e-commerce application along with instructions for setting up essential components like cert-manager and ingress-nginx.

## Application Components

The EasyShop application consists of the following components:

- **Frontend**: React.js web interface
- **Backend API**: Node.js REST API
- **Database**: MongoDB for data persistence

## Prerequisites

- Kubernetes cluster (EKS or similar)
- kubectl configured to access your cluster
- Helm 3 installed

## Installing Ingress NGINX Controller

The NGINX Ingress Controller is required to route external traffic to your services.

### Installation Steps

```bash
# Add the ingress-nginx repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

# Update your local Helm chart repository cache
helm repo update

# Install the ingress-nginx chart
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb" \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"="internet-facing"
```

### Verifying the Installation

```bash
# Check if the controller pods are running
kubectl get pods -n ingress-nginx

# Get the LoadBalancer endpoint
kubectl get service ingress-nginx-controller -n ingress-nginx
```

## Installing Cert-Manager

Cert-Manager helps with certificate issuance and management for HTTPS.

### Installation Steps

```bash
# Add the Jetstack Helm repository
helm repo add jetstack https://charts.jetstack.io

# Update your local Helm chart repository cache
helm repo update

# Install the cert-manager Helm chart
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true
```

### Create a ClusterIssuer for Let's Encrypt

Create a file named `letsencrypt-prod.yaml`:

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

Apply it to your cluster:

```bash
kubectl apply -f letsencrypt-prod.yaml
```

## Setting Up DNS with LoadBalancer and CNAME

After deploying the Ingress NGINX controller, you'll need to configure DNS to point to the LoadBalancer.

### 1. Get the LoadBalancer Address

```bash
kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
```

This will output something like: `a1b2c3d4e5f6g7.us-east-1.elb.amazonaws.com`

### 2. Create a CNAME Record

In your DNS provider (like Route53, Cloudflare, etc.):

1. Create a CNAME record for your domain (e.g., `easyshop.example.com`)
2. Point it to the LoadBalancer address from the previous step
3. Set an appropriate TTL (e.g., 300 seconds for testing)

Example DNS configuration:

| Type  | Name     | Value                                      | TTL  |
|-------|----------|-------------------------------------------|------|
| CNAME | easyshop | a1b2c3d4e5f6g7.us-east-1.elb.amazonaws.com | 300  |

### 3. Verify DNS Configuration

After DNS propagation (which might take a few minutes to hours depending on TTL settings):

```bash
nslookup easyshop.example.com
```

## Deploying the EasyShop Application

```bash
# Apply the base manifests
kubectl apply -k base/

# Or apply environment-specific overlays
kubectl apply -k overlays/production/
```

## Accessing the Application

Once deployed, you can access the application at:

- HTTP: `http://easyshop.example.com`
- HTTPS: `https://easyshop.example.com`

## Troubleshooting

### Certificate Issues

If certificates aren't issuing correctly:

```bash
# Check certificate status
kubectl get certificate -A

# Check certificate request details
kubectl get certificaterequest -A

# View cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

### Ingress Issues

```bash
# Check ingress status
kubectl get ingress -A

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

