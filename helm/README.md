# EasyShop Helm Charts

This directory contains Helm charts for deploying the EasyShop e-commerce application to Kubernetes environments.

## Directory Structure

```
helm/
├── easyshop/                # Main application Helm chart
│   ├── Chart.yaml           # Chart metadata
│   ├── values.yaml          # Default configuration values
│   ├── values-dev.yaml      # Environment-specific values
│   └── templates/           # Kubernetes manifest templates
│
├── mongodb/                 # MongoDB database Helm chart
│   ├── Chart.yaml           # Chart metadata
│   ├── values.yaml          # Default configuration values
│   └── templates/           # Kubernetes manifest templates
│
└── monitoring/              # Monitoring stack Helm charts
    ├── prometheus/          # Prometheus metrics
    ├── grafana/             # Grafana dashboards
    ├── loki/                # Log aggregation
    ├── alertmanager/        # Alert management
    └── prometheus-rules/    # Custom alerting rules
```

## Quick Start

### Prerequisites

- Kubernetes cluster up and running (EKS, GKE, AKS, or Minikube for local development)
- Helm 3.x installed and configured
- `kubectl` CLI configured to access your cluster
- Storage class available for persistent volumes

### Installation

1. **Deploy MongoDB**:

```bash
helm install mongodb helm/mongodb -n easyshop --create-namespace
```

2. **Deploy EasyShop Application**:

```bash
# For development environment
helm install easyshop helm/easyshop -f helm/easyshop/values-dev.yaml -n easyshop

# For production environment
helm install easyshop helm/easyshop -f helm/easyshop/values-prod.yaml -n easyshop
```

3. **Deploy Monitoring Stack**:

```bash
helm install monitoring-stack helm/monitoring -n monitoring --create-namespace
```

## Environment-Specific Deployments

The charts support different deployment environments through value overrides:

```bash
# Development
helm install easyshop helm/easyshop -f helm/easyshop/values-dev.yaml -n easyshop-dev

# Staging
helm install easyshop helm/easyshop -f helm/easyshop/values-staging.yaml -n easyshop-staging

# Production
helm install easyshop helm/easyshop -f helm/easyshop/values-prod.yaml -n easyshop-prod
```

## Configuration Options

### EasyShop Application

Key configurations in `values.yaml`:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of application replicas | `2` |
| `image.repository` | Application image repository | `trainwithshubham/easyshop-app` |
| `image.tag` | Application image tag | `latest` |
| `resources.requests/limits` | Resource requests and limits | Memory: `512Mi/1Gi`, CPU: `250m/500m` |
| `ingress.enabled` | Enable ingress | `true` |
| `mongodb.enabled` | Enable MongoDB dependency | `true` |

### MongoDB Database

Key configurations in `values.yaml`:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of MongoDB replicas | `3` |
| `persistence.size` | Storage size | `20Gi` |
| `auth.rootPassword` | Root password | Auto-generated if not provided |
| `resources.requests/limits` | Resource requests and limits | Memory: `1Gi/2Gi`, CPU: `500m/1000m` |

## Upgrading

To upgrade an existing deployment:

```bash
# Update the application
helm upgrade easyshop helm/easyshop -n easyshop

# Update with custom values
helm upgrade easyshop helm/easyshop -f custom-values.yaml -n easyshop
```

## Uninstalling

```bash
# Remove the application
helm uninstall easyshop -n easyshop

# Remove MongoDB
helm uninstall mongodb -n easyshop

# Remove monitoring
helm uninstall monitoring-stack -n monitoring
```

## Development Workflow

1. Make changes to chart files
2. Test changes with dry-run:
   ```bash
   helm install --dry-run --debug test helm/easyshop -n test
   ```
3. Apply changes to development environment
4. Promote to staging and production after validation

## Advanced Features

### Secret Management

The charts use Kubernetes secrets for sensitive data. To create secrets manually:

```bash
kubectl create secret generic easyshop-secrets \
  --from-literal=mongodb-password=your-password \
  --from-literal=nextauth-secret=your-secret \
  -n easyshop
```

### Horizontal Pod Autoscaling

The application chart supports Horizontal Pod Autoscaler:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Troubleshooting

### Common Issues

1. **PersistentVolumeClaim not binding**:
   - Check if storage class exists: `kubectl get sc`
   - Verify PVC status: `kubectl get pvc -n easyshop`

2. **Pod starts then crashes**:
   - Check logs: `kubectl logs -n easyshop <pod-name>`
   - Check events: `kubectl get events -n easyshop`

3. **Cannot connect to application**:
   - Verify service is running: `kubectl get svc -n easyshop`
   - Check ingress configuration: `kubectl get ingress -n easyshop`

For more detailed information on specific charts, refer to their individual README files. 