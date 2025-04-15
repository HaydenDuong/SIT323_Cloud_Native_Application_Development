# SIT323/737 - Interacting with Kubernetes

## Overview
- This task involves in forwarding traffic from a local port to the Kubernetes Service

## Tools used
- Git
- Visual Studio Code
- Node.js
- Docker
- Kubernetes
- Kubernetes CLI

## Steps
### 1. Check the status of all currently running pods and services
- Type in the following commands, in sequence:
    kubectl get pods
    
    kubectl get services

### 2. Forwarding traffic from a local port to K8s Service (found from Step 1)
- Type in the following command:
    kubectl port-forward svc/calculator-service 8080:80

### 3. Check the application with web browser of choice
- In web browser, type in:
    //http:localhost:8080