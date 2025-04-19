# Kubernetes Cost Optimization

This directory contains Kubernetes manifests designed to optimize resource usage and reduce infrastructure costs for the EasyShop application.

## Scheduled Scaling

The primary optimization implemented is scheduled scaling via CronJobs, which automatically adjusts the number of running replicas based on the time of day and expected usage patterns.

### How It Works

The `scheduled-scaling.yaml` manifest defines:

1. **Scale-down CronJob**: Reduces application replicas during non-business hours
2. **Scale-up CronJob**: Increases application replicas during business hours
3. **RBAC Configuration**: Provides necessary permissions for scaling operations

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  8:00 AM    │         │  Work Hours │         │  8:00 PM    │
│  Scale Up   │────────▶│ Full Capacity│────────▶│ Scale Down  │
│  CronJob    │         │              │         │  CronJob    │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
        ┌──────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│  Off Hours      │
│  Reduced        │
│  Capacity       │
└─────────────────┘
```

### Configuration Details

#### Scale-Down Job (Evenings)

- **Schedule**: Monday-Friday at 8:00 PM
- **Action**: Scales down the EasyShop deployment to 1 replica
- **Purpose**: Reduce resource consumption during non-business hours

#### Scale-Up Job (Mornings)

- **Schedule**: Monday-Friday at 8:00 AM
- **Action**: Scales up the EasyShop deployment to 2 replicas
- **Purpose**: Ensure adequate capacity during business hours

#### Service Account Configuration

- **ServiceAccount**: `scale-manager`
- **Role**: `deployment-scaler`
- **Permissions**: Limited to scaling deployments only
- **Namespace**: Scoped to the application namespace only

### Benefits

1. **Cost Reduction**: Typically reduces compute costs by 30-40% 
2. **Automated Management**: No manual intervention required
3. **Predictable Scaling**: Based on business hours rather than reactive scaling
4. **Resource Optimization**: Aligns resource allocation with actual usage patterns

### Customizing the Schedule

To adjust the scaling schedule for your specific needs:

1. **Modify Cron Expression**: Change the `schedule` field in each CronJob:
   - Format: `"minute hour day-of-month month day-of-week"`
   - Example: `"0 8 * * 1-5"` (8:00 AM, Monday-Friday)

2. **Adjust Replica Counts**: Change the `--replicas=N` parameter in the command:
   ```yaml
   kubectl scale deployment easyshop --replicas=2 -n easyshop-dev
   ```

3. **Target Different Services**: Add additional `kubectl scale` commands to scale multiple services:
   ```yaml
   kubectl scale deployment easyshop --replicas=2 -n easyshop-dev
   kubectl scale deployment easyshop-admin --replicas=1 -n easyshop-dev
   ```

### Implementation

```bash
# Apply the scheduled scaling
kubectl apply -f kubernetes/cost-optimization/scheduled-scaling.yaml

# Verify the CronJobs are created
kubectl get cronjobs -n easyshop-dev

# Check the service account and permissions
kubectl get serviceaccount scale-manager -n easyshop-dev
kubectl get role deployment-scaler -n easyshop-dev
```

### Monitoring the Scaling

You can monitor the scheduled scaling activities through:

1. **CronJob Events**:
   ```bash
   kubectl get events -n easyshop-dev --field-selector involvedObject.kind=CronJob
   ```

2. **Pod Scaling**:
   ```bash
   # Watch pod count changes
   kubectl get pods -n easyshop-dev -w
   ```

3. **Job Logs**:
   ```bash
   # Get the latest job created by the CronJob
   kubectl logs job/$(kubectl get jobs -n easyshop-dev \
     -l app=scale-manager --sort-by=.metadata.creationTimestamp \
     -o jsonpath='{.items[-1].metadata.name}') -n easyshop-dev
   ```

### Additional Cost Optimization Strategies

Beyond scheduled scaling, consider these additional optimizations:

1. **Resource Right-sizing**: Regularly review and adjust resource requests and limits
2. **Spot Instances**: For non-critical workloads, consider using spot/preemptible instances
3. **Cluster Autoscaling**: Enable node autoscaling to match pod demand
4. **Namespace Quotas**: Implement resource quotas to prevent over-allocation
5. **Pod Priority**: Set priorities to ensure critical services get resources first

## References

- [Kubernetes CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Cost Optimization Best Practices](https://kubernetes.io/docs/concepts/configuration/resource-management-optimization/) 