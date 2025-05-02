# SIT323/SIT737 - Task 5.2D: Dockerization - Publishing the microservice into the cloud

## Overview
This task involves publishing the `calculator` microservice (built in task 4.2C) to a private container registry on Google Cloud, then verifying that the microservice can run from the published image. The code and documentation are submitted to this GitHub repository.

## Tools Used
- Git
- Visual Studio Code
- Node.js
- Docker
- Google Cloud SDK

## Steps

### 1. Access to assigned Google Cloud Project
- Log in Google Cloud via Google Cloud SDK shell: 
    gcloud auth login

- Set the correct "current project" based on the provided <project-id>:
    gcloud config set project sit323-25t1-duong-102250c

### 2. Create a repository with Artifact Registry
- Create a repository with the following:
    - name: "calculator-repo".
    - format: "Docker".
    - mode: "Standard".
    - location type: "Region".
        - region: "australia-southeast2 (Melbourne)".
        - description: "Repository for Calculator application (Task 4.2C).

### 3. Grant Docker permission to push / pull images to Google Cloud's Artifact Registry
- Ran the following command to authenticate Docker with Artifact Registry:
    gcloud auth config-dcoker australia-southeast2-docker.pkg.dev

### 4. Push Docker image to Artifact Registry
- Create a tagged image that matching the standard of Artifact Registry for pushing:
    docker tag calculator:v1 australia-southeast2-docker.pkg.dev/sit323-25t1-duong-102550c/calculator-repo/calculator:v1

- Push the tagged image to "calculator-repo":
    docker push australia-southeast2-docker.pkg.dev/sit323-25t1-duong-102250c/calculator-repo/calculator:v1

### 5. (Optional) Pull tagged image from "calculator-repo" back to localhost
- Remove the tagged image generated from "Step 4":
    docker rmi australia-southeast2-docker.pkg.dev/sit323-25t1-duong-102250c/calculator-repo/calculator:v1

- Pull the pushed image from "calculator-repo":
    docker pull australia-southeast2-docker.pkg.dev/sit323-25t1-duong-102250c/calculator-repo/calculator:v1

### 6. Create a container from the pulled / tagged-generated image and run it
- Create a container based on the pulled / tagged-generated image and set it name to be "image-from-gc":
    docker run -d -p 3041:3034 --name image-from-gc australia-southeast2-docker.pkg.dev/sit323-25t1-duong-102250c/calculator-repo/calculator:v1

- Access the service via the generated link in "Port(s)" section of "image-from-gc" container in Docker Desktop application

## Challenges:
- Errors arose from:
    - Incorrectly assign the <region> value in Step 3.
    - Cannot push the tagged-generated image from Step 4 to "calculator-repo" due to input wrong <project-id>.
    - Pull image from "calculator-repo" with <Pull By Digest> method that created a tag-less image with lengthy name (hard to interacting with).