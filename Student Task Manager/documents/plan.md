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
    *   [ ] **`Dockerfile` Creation:**
        *   [ ] Create `Dockerfile` in project root.
        *   [ ] Use `node:18-alpine` (or similar) as base image.
        *   [ ] Set `WORKDIR /usr/src/app`.
        *   [ ] Copy `package.json` and `package-lock.json`.
        *   [ ] Run `npm ci --only=production` (or `npm install --only=production`).
        *   [ ] Copy entire application source code (`. .`).
        *   [ ] Expose port 8080.
        *   [ ] Define `CMD ["npm", "start"]`.
    *   [ ] **`.dockerignore` File:**
        *   [ ] Create/Update `.dockerignore` (include `node_modules/`, `.git/`, service account JSON key, `.vscode/`, etc.).
*   **Afternoon (Focus: Building & Testing Docker Image Locally)**
    *   [ ] **Build Docker Image:**
        *   [ ] `docker build -t student-task-manager:v1 .` (initial local tag)
    *   [ ] **Test Docker Image Locally:**
        *   [ ] Run container: `docker run -p 8080:8080 -e GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/your-key-file.json -v /path/to/your/local/key-file.json:/usr/src/app/your-key-file.json student-task-manager:v1`
            *   (Adjust path to service account key for container testing; ensure `index.js` references it correctly if needed, or rely on GKE service account for deployed version).
        *   [ ] Test CRUD API endpoints via Postman against `http://localhost:8080` (container).
*   **Evening (Focus: Pushing Image to Google Container Registry)**
    *   [ ] **Enable Container Registry API (or Artifact Registry):** (If not done on Day 1).
    *   [ ] **Configure Docker for GCR:**
        *   [ ] `gcloud auth configure-docker australia-southeast1-docker.pkg.dev` (if using Artifact Registry in aus-se1) or other GCR hosts.
    *   [ ] **Tag Docker Image for GCR:**
        *   [ ] `docker tag student-task-manager:v1 australia-southeast1-docker.pkg.dev/[PROJECT_ID]/[REPO_NAME]/student-task-manager:v1` (Artifact Registry example)
        *   [ ] OR `docker tag student-task-manager:v1 gcr.io/[PROJECT_ID]/student-task-manager:v1` (GCR example)
    *   [ ] **Push Image to GCR:**
        *   [ ] `docker push australia-southeast1-docker.pkg.dev/[PROJECT_ID]/[REPO_NAME]/student-task-manager:v1` (or GCR equivalent).

---
**Day 3: Google Kubernetes Engine (GKE) Cluster & Deployment**

*   **Morning (Focus: GKE Cluster Setup)**
    *   [ ] **Enable Kubernetes Engine API:** (If not done on Day 1).
    *   [ ] **Create GKE Cluster:**
        *   [ ] `gcloud container clusters create student-task-manager-cluster --zone australia-southeast1-a --num-nodes=1` (example, adjust zone/nodes as needed for cost/availability).
    *   [ ] **Configure `kubectl`:**
        *   [ ] `gcloud container clusters get-credentials student-task-manager-cluster --zone australia-southeast1-a`.
        *   [ ] Verify `kubectl config current-context`.
*   **Afternoon (Focus: Kubernetes Deployment & Service YAMLs)**
    *   [ ] **Create `k8s/deployment.yaml`:**
        *   Define `apiVersion: apps/v1`, `kind: Deployment`.
        *   Specify `replicas` (e.g., 1 or 2).
        *   Define `selector` and `template.metadata.labels`.
        *   Container spec:
            *   `image`: Path to your image in GCR/Artifact Registry.
            *   `ports: containerPort: 8080`.
            *   (Consider `imagePullPolicy: Always` for dev).
            *   *Note: GKE node service accounts will handle Firestore auth; no need to embed key in image for GKE.*
    *   [ ] **Create `k8s/service.yaml`:**
        *   Define `apiVersion: v1`, `kind: Service`.
        *   `spec.type: LoadBalancer`.
        *   `spec.selector` to match Deployment labels.
        *   `spec.ports`: map TCP port 80 (external) to targetPort 8080 (container).
*   **Evening (Focus: Deploying to GKE & Initial Verification)**
    *   [ ] **Apply YAMLs:**
        *   [ ] `kubectl apply -f k8s/deployment.yaml`
        *   [ ] `kubectl apply -f k8s/service.yaml`
    *   [ ] **Check Deployment Status:**
        *   [ ] `kubectl get deployments` (wait for AVAILABLE to match DESIRED).
        *   [ ] `kubectl get pods` (wait for pods to be RUNNING).
    *   [ ] **Get External IP:**
        *   [ ] `kubectl get service student-task-manager-service` (or your service name) - wait for EXTERNAL-IP to be assigned.
    *   [ ] **Test API via External IP:** Use Postman to test CRUD operations against `http://[EXTERNAL_IP]/tasks`.

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
