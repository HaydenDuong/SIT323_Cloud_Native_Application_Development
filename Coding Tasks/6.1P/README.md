# SIT323/SIT737 - Task 6.1P - Creating a Kubernetes Cluster for a containerized application

## Overview
This task involves in creating a Kubernetes cluster and deploy the container to it.

## Tools Used
- Git
- Visual Studio Code
- Node.js
- Docker
- Docker CLI
- Kubernetes
- Kubernetes CLI (kubectl)

## Steps
### 1. Setup a Kubernetes Cluster
- Open Docker Desktop Application, navigate Settings and select Kubernetes

- Enable Kubernetes by:
    - Select "Enable Kubernetes".
    - In "Cluster settings", select "Kubeadm".
    - Click "Apply & restart"

### 2. Create a Docker Image
- Create a Dockerfile that instruct Docker to build the desire Image

- Enter command: docker build -t calculator:v1 .

### 3. Create a Kubernetes Deployment
- Write a YAML file called "calculator-deployment.yaml"

- Enter command: kubectl apply -f calculator-deployment.yaml

- Or use quick method that does not require YAML file:
    kubectl create deployment calculator-deployment --image=calculator:v1

- Check the status of generated deployment
    kubectl get deployments

### 4. Create a Kubernetes Service
- Write a YAML file called "calculator-deployment-service.yaml"

- Enter command: kubectl apply -f calculator-deployment-service.yaml

- Or use quick method that does not require YAML file:
    kubectl expose calculator-deployment --type=NodePort --port 80 -target-port 3040

- Check the status of generated service
    kubectl get services