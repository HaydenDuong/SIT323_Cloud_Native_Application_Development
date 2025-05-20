// Student Task Manager API
// This is a simple Express.js application that manages tasks for students.
const express = require('express');
const admin = require('firebase-admin'); // Add firebase-admin

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
  projectId: 'sit323-studenttaskmanager'
});

// Get a reference to the Firestore database
const db = firebaseApp.firestore(); // Connect to the (default) database

const app = express();
const path = require('path');
const cors = require('cors');

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer TOKEN"

  if (token == null) {
    return res.status(401).send({ message: 'Authentication token required.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Add decoded token (contains uid, email, etc.) to request object
    next(); 
  } catch (error) {
    console.error('Error verifying auth token:', error.code, error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send({ message: 'Token expired. Please sign in again.' });
    }
    // For other auth errors (e.g., malformed token, revoked token), send 403
    return res.status(403).send({ message: 'Invalid or malformed authentication token.' });
  }
};

app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Student Task Manager API - Now with Auth!'); 
});

// Endpoint to get all tasks FOR THE AUTHENTICATED USER
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user; // UID from verified token
    const tasksCollection = db.collection('tasks').where('userId', '==', uid);
    const snapshot = await tasksCollection.orderBy('createdAt', 'desc').get(); // Optional: order by creation time

    if (snapshot.empty) {
      return res.status(200).send([]); 
    }
    const tasksList = [];
    snapshot.forEach(doc => {
      tasksList.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).send(tasksList);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send({ message: 'Failed to fetch tasks', error: error.message });
  }
});

// Endpoint to create a new task FOR THE AUTHENTICATED USER
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user; // UID from verified token
    const { title, description, dueDate, status } = req.body;
    if (!title || !dueDate || !status) {
      return res.status(400).send({ message: 'Title, due date, and status are required' });
    }
    const newTaskData = {
      userId: uid, // Associate task with user
      title,
      description: description || null, 
      dueDate,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp() // Also set updatedAt on creation
    };
    const docRef = await db.collection('tasks').add(newTaskData);
    res.status(201).send({ id: docRef.id, ...newTaskData });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send({ message: 'Failed to create task', error: error.message });
  }
});

// Endpoint to update a task by ID, checking ownership
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    if (!title && description === undefined && !dueDate && !status) { // Check if description is explicitly undefined for clearing
      return res.status(400).send({ message: 'No fields provided for update' });
    }

    const taskRef = db.collection('tasks').doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).send({ message: 'Task not found' });
    }
    const taskData = doc.data();
    if (taskData.userId !== uid) {
      return res.status(403).send({ message: 'Forbidden: You do not own this task.' });
    }

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description; // Allows setting to null or empty string
    if (dueDate !== undefined) updatedFields.dueDate = dueDate;
    if (status !== undefined) updatedFields.status = status;
    updatedFields.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await taskRef.update(updatedFields);
    // Fetch the updated document to send back the full updated state
    const updatedDoc = await taskRef.get();
    res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.code === 5) { 
        return res.status(404).send({ message: 'Task not found during update attempt' });
    }
    res.status(500).send({ message: 'Failed to update task', error: error.message });
  }
});

// Endpoint to delete a task by ID, checking ownership
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const taskRef = db.collection('tasks').doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).send({ message: 'Task not found' });
    }
    const taskData = doc.data();
    if (taskData.userId !== uid) {
      return res.status(403).send({ message: 'Forbidden: You do not own this task.' });
    }
    await taskRef.delete();
    res.status(200).send({ message: 'Task deleted successfully', id: id });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send({ message: 'Failed to delete task', error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server with auth is running on http://localhost:${PORT}`);
});