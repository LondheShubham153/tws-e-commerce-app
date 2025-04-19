# EasyShop Kubernetes Configuration

This directory contains Kubernetes manifests for deploying the EasyShop e-commerce application across multiple environments.

## Directory Structure

```
kubernetes/
├── base/                  # Base manifests shared across all environments
│   ├── 00-cluster-issuer.yml
│   ├── 01-namespace.yaml
│   ├── 02-mongodb-pv.yaml
│   ├── 03-mongodb-pvc.yaml
│   ├── 04-configmap.yaml
│   ├── 05-secrets.yaml
│   ├── 06-mongodb-service.yaml
│   ├── 07-mongodb-statefulset.yaml
│   ├── 09-easyshop-service.yaml
│   ├── 10-ingress.yaml
│   ├── 11-hpa.yaml
│   └── 12-migration-job.yaml
│
├── dev/                   # Development environment specific configurations
│   ├── 08-easyshop-deployment.yaml
│   ├── 13-network-policy.yaml
│   └── 14-pod-disruption-budget.yaml
│
├── staging/               # Staging environment specific configurations
│   ├── 08-easyshop-deployment.yaml
│   ├── 13-network-policy.yaml
│   └── 14-pod-disruption-budget.yaml
│
├── prod/                  # Production environment specific configurations
│   ├── 07-mongodb-statefulset.yaml  # Production-specific MongoDB with high availability
│   ├── 08-easyshop-deployment.yaml
│   ├── 13-network-policy.yaml
│   └── 14-pod-disruption-budget.yaml
│
├── monitoring/            # Monitoring components
│   ├── mongodb-backup-cronjob.yaml
│   └── prometheus-values.yaml
│
└── cost-optimization/     # Cost optimization configurations
    └── scheduled-scaling.yaml
```

## Environment Strategy

The Kubernetes manifests are structured with a "base + overlay" approach:

1. **Base**: Contains common manifests used across all environments
2. **Environment-specific overlays**: Contains environment-specific configurations (dev, staging, prod)

This approach provides:
- Consistent core infrastructure across environments
- Environment-specific customizations for resource allocation, security policies, and scaling parameters
- Clear separation of concerns for easier maintenance

## Manifest Numbering Convention

Manifests follow a numbered sequence to ensure correct application order:

- `00-xx`: Infrastructure prerequisites
- `01-05`: Namespace and configuration resources
- `06-07`: Database resources
- `08-10`: Application resources
- `11-14`: Scaling, networking, and auxiliary resources

## Key Components

### Base Components

- **Namespace**: Isolated environment for EasyShop resources
- **ConfigMap**: Environment variables and configuration
- **Secrets**: Sensitive data management
- **MongoDB**: Database for the application
- **Services**: Network exposure for components
- **Ingress**: External access to the application
- **HPA**: Auto-scaling based on resource utilization
- **Migration Job**: Database initialization and migration

### Environment-Specific Components

- **Deployment**: Application deployment strategy and configuration
- **Network Policies**: Network security rules
- **Pod Disruption Budgets**: Availability guarantees during cluster operations

### Monitoring

- **MongoDB Backup CronJob**: Scheduled database backups
- **Prometheus Values**: Monitoring configuration

### Cost Optimization

- **Scheduled Scaling**: Automatic scaling based on time of day to optimize resource usage

## Deployment Guide

### Prerequisites

- Kubernetes cluster (v1.20+)
- Kubectl configured to access your cluster
- Helm (v3.0+) for monitoring components
- A storage class for persistent volumes

### Deploying to Development

```bash
# Create namespace and apply base resources
kubectl apply -f kubernetes/base/01-namespace.yaml
kubectl apply -f kubernetes/base/[02-07]*.yaml

# Apply development-specific resources
kubectl apply -f kubernetes/dev/

# Apply the application deployment
kubectl apply -f kubernetes/base/[09-12]*.yaml

# Enable cost optimization (optional)
kubectl apply -f kubernetes/cost-optimization/scheduled-scaling.yaml
```

### Deploying to Staging/Production

```bash
# Create namespace with appropriate name
kubectl apply -f kubernetes/base/01-namespace.yaml

# Apply base resources (modify namespace as needed)
kubectl apply -f kubernetes/base/[02-07]*.yaml

# Apply staging/production-specific resources
kubectl apply -f kubernetes/staging/  # or kubernetes/prod/

# Apply the application resources
kubectl apply -f kubernetes/base/[09-12]*.yaml
```

### Deploying Monitoring

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Apply monitoring resources
kubectl apply -f kubernetes/monitoring/
```

## Environment-Specific Configurations

### Development

- Lower resource requirements
- Relaxed security policies
- Faster deployment cycles
- Cost optimization through scheduled scaling

### Staging

- Production-like configuration
- Full testing environment
- Moderate resource allocation
- Similar security policies to production

### Production

- Highly available MongoDB with replication
- Strict security policies with comprehensive network policies
- Enhanced Pod Disruption Budgets for maximum availability
- Higher resource allocation and scaling parameters
- Regular database backups

## Cost Optimization

The `scheduled-scaling.yaml` manifest implements automated scaling based on time of day:

- **Scale Down (Nights)**: Reduces replicas during non-business hours (8:00 PM)
- **Scale Up (Mornings)**: Increases replicas during business hours (8:00 AM)
- **Custom Service Account**: Provides necessary RBAC permissions for scaling operations

This helps reduce cloud resource costs by up to 40% by dynamically adjusting resources based on actual usage patterns.

## Troubleshooting

### Common Issues

1. **PersistentVolume not binding**:
   - Check storage class: `kubectl get sc`
   - Ensure PV/PVC parameters match: `kubectl describe pv/pvc`

2. **Pod startup failures**:
   - Check pod logs: `kubectl logs -n easyshop-[env] [pod-name]`
   - Describe pod for events: `kubectl describe pod -n easyshop-[env] [pod-name]`

3. **Network connectivity issues**:
   - Verify network policies: `kubectl get networkpolicy -n easyshop-[env]`
   - Check service endpoints: `kubectl get endpoints -n easyshop-[env]`

4. **Resource constraints**:
   - Check node resources: `kubectl describe node [node-name]`
   - View pod resource usage: `kubectl top pod -n easyshop-[env]`

### Useful Commands

```bash
# View all resources in a namespace
kubectl get all -n easyshop-dev

# Check pod logs with previous instance
kubectl logs -p -n easyshop-dev [pod-name]

# View HPA status
kubectl get hpa -n easyshop-dev

# Check ingress status
kubectl get ingress -n easyshop-dev
```

## Security Best Practices

The Kubernetes configuration implements several security best practices:

1. **Network Policies**: Restrict pod-to-pod communication
2. **Non-root containers**: Run containers with non-root users
3. **Read-only filesystems**: Prevent filesystem modifications
4. **Resource limits**: Prevent resource exhaustion
5. **Secret management**: Secure storage of sensitive information
6. **RBAC**: Least privilege access control

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/) 