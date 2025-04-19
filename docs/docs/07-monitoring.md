# Monitoring EasyShop with Prometheus and Grafana

This guide explains how to set up comprehensive monitoring for your EasyShop deployment using Prometheus for metrics collection and Grafana for visualization.

## Overview

The monitoring stack consists of:
- **Prometheus**: For collecting and storing metrics
- **Grafana**: For visualizing metrics and creating dashboards
- **Node Exporter**: For hardware and OS metrics
- **kube-state-metrics**: For Kubernetes object metrics

## Setting Up Prometheus

### Installation using Helm

1. **Add the Prometheus Helm repository:**
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   ```

2. **Create a monitoring namespace:**
   ```bash
   kubectl create namespace monitoring
   ```

3. **Install Prometheus:**
   ```bash
   helm install prometheus prometheus-community/prometheus \
     --namespace monitoring \
     --set alertmanager.persistentVolume.storageClass="gp2" \
     --set server.persistentVolume.storageClass="gp2" \
     --set server.retention="15d"
   ```

   > Note: Adjust the storage class name according to your cluster's available storage classes.

4. **Verify installation:**
   ```bash
   kubectl get pods -n monitoring
   ```

### Accessing Prometheus UI

1. **Port-forwarding method:**
   ```bash
   kubectl port-forward -n monitoring svc/prometheus-server 9090:80
   ```
   Access Prometheus at http://localhost:9090

2. **Service exposure method (optional):**
   You can expose Prometheus as a LoadBalancer service for external access:
   ```bash
   kubectl patch svc prometheus-server -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
   ```

## Setting Up Grafana

### Installation using Helm

1. **Add the Grafana Helm repository:**
   ```bash
   helm repo add grafana https://grafana.github.io/helm-charts
   helm repo update
   ```

2. **Create a values file (grafana-values.yaml):**
   ```yaml
   datasources:
     datasources.yaml:
       apiVersion: 1
       datasources:
       - name: Prometheus
         type: prometheus
         url: http://prometheus-server.monitoring.svc.cluster.local
         access: proxy
         isDefault: true
   
   dashboardProviders:
     dashboardproviders.yaml:
       apiVersion: 1
       providers:
       - name: 'default'
         orgId: 1
         folder: ''
         type: file
         disableDeletion: false
         editable: true
         options:
           path: /var/lib/grafana/dashboards/default
   
   dashboards:
     default:
       kubernetes-cluster:
         gnetId: 3119
         revision: 1
         datasource: Prometheus
       kubernetes-pods:
         gnetId: 10856
         revision: 1
         datasource: Prometheus
       node-exporter:
         gnetId: 6417
         revision: 1
         datasource: Prometheus
   
   persistence:
     enabled: true
     storageClassName: gp2
     size: 5Gi
   
   service:
     type: ClusterIP
   
   adminPassword: "EasyShopAdmin"
   ```

3. **Install Grafana:**
   ```bash
   helm install grafana grafana/grafana \
     --namespace monitoring \
     -f grafana-values.yaml
   ```

### Accessing Grafana UI

1. **Port-forwarding method:**
   ```bash
   kubectl port-forward -n monitoring svc/grafana 3000:80
   ```
   Access Grafana at http://localhost:3000
   - Username: admin
   - Password: EasyShopAdmin (or as set in the values file)

2. **Service exposure method (optional):**
   You can expose Grafana as a LoadBalancer service for external access:
   ```bash
   kubectl patch svc grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
   ```

## Application-Specific Monitoring

### Adding Metrics to EasyShop Application

1. **Add annotations to your application deployment:**
   
   Update your EasyShop deployment YAML:
   ```yaml
   metadata:
     annotations:
       prometheus.io/scrape: "true"
       prometheus.io/path: "/metrics"
       prometheus.io/port: "3000"
   ```

2. **Implement metrics endpoint in your application:**
   
   If your Next.js application doesn't have a metrics endpoint yet, you can use the following libraries:
   - `prom-client` - Prometheus client for Node.js
   - `next-metrics` - Next.js metrics library

   Example implementation:
   ```javascript
   // pages/api/metrics.js
   import client from 'prom-client';

   // Create a Registry to register metrics
   const register = new client.Registry();

   // Add a default metrics collector
   client.collectDefaultMetrics({ register });

   // Create custom metrics
   const httpRequestCounter = new client.Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status_code'],
     registers: [register]
   });

   export default async function handler(req, res) {
     // Increment metrics on request
     httpRequestCounter.inc({
       method: req.method,
       route: req.url,
       status_code: res.statusCode
     });
     
     // Return metrics
     res.setHeader('Content-Type', register.contentType);
     res.send(await register.metrics());
   }
   ```

### Creating Custom Dashboards

1. In Grafana, click the "+" icon and select "Create Dashboard"
2. Add panels with relevant metrics:
   - Application metrics (response time, error rate, request count)
   - Resource usage (CPU, memory)
   - MongoDB metrics
   - Node.js runtime metrics

3. Example PromQL queries:
   - Request rate: `rate(http_requests_total[5m])`
   - Error rate: `sum(rate(http_requests_total{status_code=~"5.."}[5m]))/sum(rate(http_requests_total[5m]))*100`
   - Memory usage: `container_memory_usage_bytes{pod=~"easyshop.*"}`
   - CPU usage: `sum(rate(container_cpu_usage_seconds_total{pod=~"easyshop.*"}[5m]))`

## Setting Up Alerts

Prometheus AlertManager allows you to define alerts based on metric thresholds:

1. **Create an alerting rules file (alert-rules.yaml):**
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: PrometheusRule
   metadata:
     name: easyshop-alerts
     namespace: monitoring
   spec:
     groups:
     - name: easyshop
       rules:
       - alert: HighErrorRate
         expr: sum(rate(http_requests_total{status_code=~"5.."}[5m]))/sum(rate(http_requests_total[5m]))*100 > 5
         for: 5m
         labels:
           severity: critical
         annotations:
           summary: "High error rate detected"
           description: "Error rate is above 5% for more than 5 minutes"
       
       - alert: HighMemoryUsage
         expr: sum(container_memory_usage_bytes{pod=~"easyshop.*"}) / sum(container_memory_limits_bytes{pod=~"easyshop.*"}) * 100 > 80
         for: 5m
         labels:
           severity: warning
         annotations:
           summary: "High memory usage detected"
           description: "Memory usage is above 80% for more than 5 minutes"
   ```

2. **Apply the alerting rules:**
   ```bash
   kubectl apply -f alert-rules.yaml
   ```

3. **Configure AlertManager to send notifications:**
   Create a config file with your notification channels (Slack, Email, etc.)

## Maintenance and Best Practices

1. **Regular updates:**
   ```bash
   helm repo update
   helm upgrade prometheus prometheus-community/prometheus --namespace monitoring
   helm upgrade grafana grafana/grafana --namespace monitoring -f grafana-values.yaml
   ```

2. **Data retention:**
   Adjust Prometheus retention period based on your needs:
   ```bash
   helm upgrade prometheus prometheus-community/prometheus \
     --namespace monitoring \
     --set server.retention="30d"
   ```

3. **Backup Grafana dashboards:**
   Export important dashboards as JSON files for backup

4. **Resource allocation:**
   Adjust resource requests and limits for Prometheus and Grafana as your application scales

## Troubleshooting

1. **Prometheus not scraping targets:**
   - Check service discovery: `http://localhost:9090/service-discovery`
   - Verify that your application exposes metrics correctly
   - Check network policies allowing scraping

2. **Grafana can't connect to Prometheus:**
   - Verify the Prometheus service address in the data source configuration
   - Check that Prometheus is running and accessible

3. **High resource usage by Prometheus:**
   - Adjust retention period
   - Add resource limits
   - Consider using remote storage for long-term metrics
