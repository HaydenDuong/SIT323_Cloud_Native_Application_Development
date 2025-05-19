### **4-Day Intensive Cloud-Native Development Plan (Revised for GKE)**

**Goal:** Deploy the Student Task Manager on GCP using Docker, Google Kubernetes Engine (GKE), Firestore, and implement core authentication.

---
**Day 1: GCP Setup & Firestore Backend Integration (Completed)**

*   **Morning (Focus: GCP & Firestore Setup)**
    *   [X] **GCP Project:**
        *   [X] Confirm/Create your Google Cloud Project (`SIT323-StudentTaskManager`).
        *   [X] Familiarize yourself with the GCP Console.
    *   [X] **Enable APIs:**
        *   [X] Enable "Cloud Firestore API".
        *   [X] Enable "App Engine Admin API" (Though not used for deployment, good to have for general App Engine visibility if needed later, or disable if strictly GKE).
        *   [X] Enable "Cloud Build API".
        *   [X] Enable "Container Registry API" (or "Artifact Registry API").
        *   [X] Enable "Kubernetes Engine API".
    *   [X] **Firestore Database:**
        *   [X] Create a Cloud Firestore database in Native mode (ID: `(default)`).
        *   [X] Choose region (`australia-southeast2` for Firestore, App Engine will be separate).
        *   [X] Define initial security rules (test mode).
*   **Afternoon (Focus: Backend Migration to Firestore)**
    *   [X] **Service Account (for local development):**
        *   [X] Create a service account (`student-task-manager-dev`).
        *   [X] Grant it "Cloud Datastore User" role.
        *   [X] Download JSON key file, add to `.gitignore`.
    *   [X] **Update Backend (`index.js`):**
        *   [X] Add `firebase-admin` package.
        *   [X] Initialize Firebase Admin SDK (using service account key, `projectId`, and default database).
        *   [X] Rewrite Task Creation (`POST /tasks`) for Firestore.
        *   [X] Rewrite Get All Tasks (`GET /tasks`) for Firestore.
*   **Evening (Focus: Backend CRUD Completion & Testing)**
    *   [X] **Update Backend (`index.js`) (Continued):**
        *   [X] Rewrite Update Task (`PUT /tasks/:id`) for Firestore.
        *   [X] Rewrite Delete Task (`DELETE /tasks/:id`) for Firestore.
    *   [X] **Local Backend Testing:**
        *   [X] Thoroughly test all CRUD API endpoints using Postman against local server.

---
**Day 2: Dockerization & Google Container Registry (GCR)**

*   **Morning (Focus: Dockerizing the Application)**
    *   [X] **`Dockerfile` Creation:**
        *   [X] Create `Dockerfile` in project root.
        *   [X] Use `node:18-alpine` (or similar) as base image.
        *   [X] Set `WORKDIR /usr/src/app`.
        *   [X] Copy `package.json` and `package-lock.json`.
        *   [X] Run `npm ci --only=production` (or `npm install --only=production`).
        *   [X] Copy entire application source code (`. .`).
        *   [X] Expose port 8080.
        *   [X] Define `CMD ["npm", "start"]`.
    *   [X] **`.dockerignore` File:**
        *   [X] Create/Update `.dockerignore` (include `node_modules/`, `.git/`, service account JSON key, `.vscode/`, etc.).
*   **Afternoon (Focus: Building & Testing Docker Image Locally)**
    *   [X] **Build Docker Image:**
        *   [X] `docker build -t student-task-manager:v1 .` (initial local tag)
    *   [X] **Test Docker Image Locally:**
        *   [X] Run container: `docker run -p 8080:8080 student-task-manager:v1` (Simplified as key file is no longer in image)
        *   [X] Test CRUD API endpoints via Postman against `http://localhost:8080` (container).
*   **Evening (Focus: Pushing Image to Google Container Registry)**
    *   [X] **Enable Container Registry API (or Artifact Registry):** (If not done on Day 1).
    *   [X] **Configure Docker for GCR:**
        *   [X] `gcloud auth configure-docker australia-southeast2-docker.pkg.dev` (User used aus-se2)
    *   [X] **Tag Docker Image for GCR:**
        *   [X] `docker tag student-task-manager:v2 australia-southeast2-docker.pkg.dev/sit323-studenttaskmanager/studenttaskmanager/hayden2310/student-task-manager:v2` (User's actual path)
    *   [X] **Push Image to GCR:**
        *   [X] `docker push australia-southeast2-docker.pkg.dev/sit323-studenttaskmanager/studenttaskmanager/hayden2310/student-task-manager:v2`

---
**Day 3: Google Kubernetes Engine (GKE) Cluster & Deployment**

*   **Morning (Focus: GKE Cluster Setup)**
    *   [X] **Enable Kubernetes Engine API:** (If not done on Day 1).
    *   [X] **Create GKE Cluster:**
        *   [X] `gcloud container clusters create studenttaskmanager-cluster-standard --zone australia-southeast2-a --num-nodes=1 --machine-type e2-medium --scopes=\"https://www.googleapis.com/auth/cloud-platform\"` (User's actual settings)
    *   **Configure `kubectl`:**
        *   [X] `gcloud container clusters get-credentials studenttaskmanager-cluster-standard --zone australia-southeast2-a`.
        *   [X] Verify `kubectl config current-context`.
*   **Afternoon (Focus: Kubernetes Deployment & Service YAMLs)**
    *   [X] **Create `k8s/deployment.yaml`:**
        *   Define `apiVersion: apps/v1`, `kind: Deployment`.
        *   Specify `replicas` (e.g., 1 or 2).
        *   Define `selector` and `template.metadata.labels`.
        *   Container spec:
            *   `image`: Path to your image in GCR/Artifact Registry.
            *   `ports: containerPort: 8080`.
            *   (Consider `imagePullPolicy: Always` for dev).
            *   Set up Workload Identity (KSA, GSA binding, annotations, `serviceAccountName` in deployment)
    *   [X] **Create `k8s/service.yaml`:**
        *   Define `apiVersion: v1`, `kind: Service`.
        *   `spec.type: LoadBalancer`.
        *   `spec.selector` to match Deployment labels.
        *   `spec.ports`: map TCP port 80 (external) to targetPort 8080 (container).
*   **Evening (Focus: Deploying to GKE & Initial Verification)**
    *   [X] **Apply YAMLs:**
        *   [X] `kubectl apply -f k8s/deployment.yaml`
        *   [X] `kubectl apply -f k8s/service.yaml`
        *   [X] `kubectl apply -f k8s/ksa.yaml`
    *   [X] **Check Deployment Status:**
        *   [X] `kubectl get deployments` (wait for AVAILABLE to match DESIRED).
        *   [X] `kubectl get pods` (wait for pods to be RUNNING).
    *   [X] **Get External IP:**
        *   [X] `kubectl get service student-task-manager-service` (or your service name) - wait for EXTERNAL-IP to be assigned.
    *   [X] **Test API via External IP:** Use Postman to test CRUD operations against `http://[EXTERNAL_IP]/tasks`.

---
**Day 4: Frontend Connection, Authentication & Testing**

*   **Morning (Focus: Frontend API Connection & Basic UI Test)**
    *   [ ] **Update Frontend (`public/script.js`):**
        *   [ ] Change `fetch` URLs to use the GKE Load Balancer's External IP (e.g., `http://[EXTERNAL_IP]/tasks`).
    *   [ ] **Basic Frontend Testing:**
        *   [ ] Serve `public` folder locally (e.g., with `npx serve public` or VS Code Live Server) and test if it can C.R.U.D tasks against the GKE backend.
        *   *(Note: For this local frontend test to work against GKE IP, ensure GKE service is HTTP, not HTTPS yet, or handle CORS if issues arise).*
    *   [ ] **Fix Delete Button Bug (Event Delegation):** (If still pending from original local version).
*   **Afternoon (Focus: Firebase Authentication - Frontend)**
    *   [ ] **Firebase Project Web App Setup:**
        *   [ ] In Firebase Console -> Project Settings -> Add app -> Web.
        *   [ ] Get Firebase config object (`apiKey`, `authDomain`, etc.).
    *   [ ] **Frontend Firebase SDK & UI:**
        *   [ ] Add Firebase SDKs to `public/index.html`.
        *   [ ] Initialize Firebase in `public/script.js` with config.
        *   [ ] Create Login/Signup UI in `public/index.html`.
        *   [ ] Implement Signup, Login, Logout functions in `public/script.js`.
        *   [ ] Use `onAuthStateChanged` to manage UI state.
*   **Evening (Focus: Firebase Authentication - Backend & Final Testing)**
    *   [ ] **Backend: Secure Endpoints:**
        *   [ ] Update `index.js` Express routes: Add middleware to verify Firebase ID tokens (from `Authorization: Bearer <token>` header) using `admin.auth().verifyIdToken()`.
        *   [ ] Protect C.R.U.D. task routes.
    *   [ ] **Frontend: Send ID Token:**
        *   [ ] Modify `public/script.js` API calls to include ID token in headers.
    *   [ ] **Associate Tasks with Users in Firestore:**
        *   [ ] Update `POST /tasks` to add `ownerId: req.user.uid`.
        *   [ ] Update `GET /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` to filter/authorize by `ownerId`.
    *   [ ] **End-to-End Testing:** Test full auth flow and task management on GKE.
    *   [ ] **Review & Document:** Note achievements, challenges, and deviations for report.

---
