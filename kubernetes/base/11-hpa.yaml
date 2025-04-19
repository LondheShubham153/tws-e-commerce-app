apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: easyshop-hpa
  namespace: easyshop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: easyshop
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70