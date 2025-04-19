# EasyShop Monitoring Stack

This directory contains Helm charts for deploying a comprehensive monitoring stack for the EasyShop e-commerce application on Kubernetes.

## Overview

The monitoring stack provides full observability for your EasyShop deployment through:

- **Metrics Collection**: Prometheus scrapes and stores time-series data
- **Visualization**: Grafana dashboards present actionable insights
- **Alerting**: Alertmanager handles notification routing
- **Log Aggregation**: Loki collects and indexes container logs
- **Custom Rules**: Prometheus rules define alerts and recording rules

## Directory Structure

```
monitoring/
├── prometheus/             # Prometheus metrics server
│   └── values.yaml         # Prometheus configuration
│
├── grafana/                # Grafana dashboards
│   └── values.yaml         # Grafana configuration
│
├── loki/                   # Log aggregation
│   └── values.yaml         # Loki + Promtail configuration
│
├── alertmanager/           # Alert management
│   └── values.yaml         # Alertmanager configuration
│
├── prometheus-rules/       # Custom alerting rules
│   └── values.yaml         # Rule definitions
│
└── README.md               # This documentation
```

## Component Details

### Prometheus

- **Purpose**: Collects and stores metrics from EasyShop and infrastructure
- **Key Features**:
  - Service discovery for automatic target detection
  - Efficient time-series database
  - PromQL query language
  - Integration with Kubernetes
- **Default Port**: 9090

### Grafana

- **Purpose**: Visualizes metrics and logs through dashboards
- **Key Features**:
  - Pre-configured dashboards for EasyShop
  - Multiple data source support (Prometheus, Loki)
  - Alerting capabilities
  - User authentication
- **Default Port**: 3000

### Loki

- **Purpose**: Aggregates and indexes logs from all services
- **Key Features**:
  - Lightweight log storage
  - Label-based log queries (similar to Prometheus)
  - Integration with Promtail for log collection
  - Grafana integration for visualization
- **Default Port**: 3100

### Alertmanager

- **Purpose**: Handles alert routing, grouping, and notifications
- **Key Features**:
  - Deduplication of similar alerts
  - Grouping of related alerts
  - Routing to appropriate receivers
  - Silencing and inhibition capabilities
- **Default Port**: 9093

### Prometheus Rules

- **Purpose**: Defines alerting and recording rules
- **Key Features**:
  - Alert conditions for EasyShop components
  - SLO/SLA monitoring rules
  - Infrastructure health rules
  - Pre-computed expressions via recording rules

## Installation

### Prerequisites

- Kubernetes cluster with Helm installed
- Storage class for persistent volumes
- Network access to the Kubernetes pods
- Namespace for monitoring components

### Quick Install

Deploy the entire monitoring stack:

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Install the stack
helm install monitoring . -n monitoring
```

### Component-by-Component Installation

For more control, install components individually:

```bash
# Install Prometheus
helm install prometheus prometheus-community/prometheus -f prometheus/values.yaml -n monitoring

# Install Grafana
helm install grafana grafana/grafana -f grafana/values.yaml -n monitoring

# Install Loki and Promtail
helm install loki grafana/loki-stack -f loki/values.yaml -n monitoring

# Install Alertmanager
helm install alertmanager prometheus-community/alertmanager -f alertmanager/values.yaml -n monitoring

# Install Prometheus Rules
helm install rules prometheus-community/prometheus-rules -f prometheus-rules/values.yaml -n monitoring
```

## Accessing the Components

### Grafana

```bash
# Port-forward Grafana service
kubectl port-forward svc/grafana 3000:80 -n monitoring
```

Access Grafana at http://localhost:3000 with default credentials:
- Username: admin
- Password: admin (prompted to change on first login)

### Prometheus

```bash
# Port-forward Prometheus service
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring
```

Access Prometheus at http://localhost:9090

### Alertmanager

```bash
# Port-forward Alertmanager service
kubectl port-forward svc/alertmanager 9093:9093 -n monitoring
```

Access Alertmanager at http://localhost:9093

## Configuring Alerts

### Email Notifications

Update the Alertmanager configuration to send email notifications:

```yaml
# alertmanager/values.yaml
config:
  global:
    smtp_smarthost: 'smtp.example.com:587'
    smtp_from: 'alerts@example.com'
    smtp_auth_username: 'alerts@example.com'
    smtp_auth_password: 'password'
```

### Slack Notifications

Configure Slack notifications by adding a webhook:

```yaml
# alertmanager/values.yaml
config:
  receivers:
    - name: 'slack-notifications'
      slack_configs:
        - api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX'
          channel: '#alerts'
```

## Custom Dashboards

Pre-configured dashboards are included for:

1. **EasyShop Overview**: Application metrics
2. **Node Metrics**: Server resource utilization
3. **MongoDB Metrics**: Database performance
4. **API Performance**: Response times and error rates

To import additional dashboards:

1. Export dashboard JSON from Grafana
2. Add to the `dashboards` section in `grafana/values.yaml`

## Resource Requirements

Minimum recommended resources:

| Component | CPU Request | Memory Request |
|-----------|------------|----------------|
| Prometheus | 200m | 1Gi |
| Grafana | 100m | 128Mi |
| Loki | 100m | 128Mi |
| Alertmanager | 50m | 64Mi |

## Troubleshooting

### Common Issues

1. **No data in Grafana dashboards**:
   - Verify Prometheus is running: `kubectl get pods -n monitoring`
   - Check Prometheus targets: Access `/targets` on Prometheus UI
   - Verify data source configuration in Grafana

2. **Missing logs in Loki**:
   - Check Promtail is running on all nodes
   - Verify log volume mounts are correct
   - Check Loki service is accessible

3. **Alerts not firing**:
   - Verify rules are loaded in Prometheus: Access `/rules` on Prometheus UI
   - Check Alertmanager configuration
   - View alert status in Prometheus UI under `/alerts`

### Debugging Commands

```bash
# Check pod status
kubectl get pods -n monitoring

# View component logs
kubectl logs -l app=prometheus-server -n monitoring
kubectl logs -l app=grafana -n monitoring

# Check persistent volume claims
kubectl get pvc -n monitoring
```

## Production Considerations

For production deployments:

1. **Set up proper authentication** for all components
2. **Increase retention period** for Prometheus (default: 15 days)
3. **Configure remote storage** for long-term metric storage
4. **Adjust resource limits** based on cluster size and metrics volume
5. **Implement high availability** for critical components

## Customization

To customize the monitoring stack:

1. Modify the respective `values.yaml` files
2. Use `helm upgrade` to apply changes:

```bash
helm upgrade prometheus prometheus-community/prometheus -f prometheus/values.yaml -n monitoring
``` 