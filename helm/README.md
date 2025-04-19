# EasyShop Helm Chart

This Helm chart deploys the EasyShop e-commerce application on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- cert-manager for TLS certificates
- Nginx Ingress Controller

## Installation

1. First, add the required repositories:

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
```

2. Install cert-manager if not already installed:

```bash
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true
```

3. Install the EasyShop chart:

```bash
helm install easyshop ./helm \
  --namespace easyshop \
  --create-namespace \
  --values values.yaml
```

## Configuration

The following table lists the configurable parameters and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.name` | Application name | `easyshop` |
| `app.namespace` | Kubernetes namespace | `easyshop` |
| `app.replicas` | Number of application replicas | `2` |
| `app.image.repository` | Application image repository | `yasir261/easyshop-app` |
| `app.image.tag` | Application image tag | `latest` |
| `mongodb.enabled` | Enable MongoDB deployment | `true` |
| `mongodb.persistence.size` | MongoDB storage size | `5Gi` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.host` | Ingress hostname | `easyshop.letsdeployit.com` |
| `hpa.enabled` | Enable HorizontalPodAutoscaler | `true` |
| `networkPolicy.enabled` | Enable NetworkPolicy | `true` |

## Upgrade

To upgrade the release:

```bash
helm upgrade easyshop ./helm \
  --namespace easyshop \
  --values values.yaml
```

## Uninstallation

To uninstall the release:

```bash
helm uninstall easyshop -n easyshop
```

## Architecture

The chart deploys the following components:

- NextJS frontend application
- MongoDB database with persistent storage
- Ingress for external access
- HorizontalPodAutoscaler for scaling
- NetworkPolicy for security
- ConfigMap and Secrets for configuration
- RBAC resources (optional)
- Migration job for database initialization

## Development

To template the chart without installing:

```bash
helm template easyshop ./helm --debug
```

To validate the chart:

```bash
helm lint ./helm
```

## Troubleshooting

Common issues and solutions:

1. **MongoDB connection issues**
   - Check MongoDB service: `kubectl get svc -n easyshop`
   - Verify MongoDB is running: `kubectl get pods -n easyshop`

2. **Ingress issues**
   - Check ingress status: `kubectl get ingress -n easyshop`
   - Verify TLS secret: `kubectl get secret easyshop-tls -n easyshop`

3. **Pod scaling issues**
   - Check HPA status: `kubectl get hpa -n easyshop`
   - View HPA metrics: `kubectl describe hpa -n easyshop`