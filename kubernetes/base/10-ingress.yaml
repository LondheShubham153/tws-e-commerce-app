apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: easyshop-ingress
  namespace: easyshop
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - easyshop.letsdeployit.com
    secretName: easyshop-tls-secret  # Cert-Manager will manage this
  rules:
  - host: easyshop.letsdeployit.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: easyshop-service
            port:
              number: 80

