## Nginx ingress controller:<br/>
> 1. Install the Nginx Ingress Controller using Helm:
```bash
kubectl create namespace ingress-nginx
```
> 2. Add the Nginx Ingress Controller Helm repository:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```
> 3. Install the Nginx Ingress Controller:
```bash
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer
```
> 4. Check the status of the Nginx Ingress Controller:
```bash
kubectl get pods -n ingress-nginx
```
> 5. Get the external IP address of the LoadBalancer service:
```bash
kubectl get svc -n ingress-nginx
```

## Install Cert-Manager

> 1. **Jetpack:** Add the Jetstack Helm repository:
```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
```
> 2. **Cert-Manager:** Install the Cert-Manager Helm chart:
```bash
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true
``` 
> 3. **Check pods:**Check the status of the Cert-Manager pods:
```bash
kubectl get pods -n cert-manager
```

> 4. **DNS Setup:** Find your DNS name from the LoadBalancer service:
```bash
kubectl get svc nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
> 5. Create a DNS record for your domain pointing to the LoadBalancer IP.
> - Go to your godaddy dashboard and create a new CNAME record and map the DNS just your got in the terminal.