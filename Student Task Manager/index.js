// Student Task Manager API
// This is a simple Express.js application that manages tasks for students.
const express = require('express');
const admin = require('firebase-admin'); // Add firebase-admin
const serviceAccount = require('./sit323-studenttaskmanager-43b726fc0e9a.json'); // Add path to your service account key

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({ // Assign to a variable
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sit323-studenttaskmanager' // Explicitly add your project ID
});

// Get a reference to the Firestore database
// const db = admin.firestore('studenttaskmanagerdb'); // Comment out the old way
const db = firebaseApp.firestore(); // Connect to the (default) database

const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Student Task Manager API'); 
});

// Endpoint to get all tasks
app.get('/tasks', async (req, res) => { // Make the handler async
  try {
    const tasksCollection = db.collection('tasks');
    const snapshot = await tasksCollection.get();

    if (snapshot.empty) {
      return res.status(200).send([]); // Send empty array if no tasks
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

// Endpoint to create a new task
// Example: POST /tasks with body { "title": "Task 1", "dueDate": "2023-10-01", "status": "pending" }
app.post('/tasks', async (req, res) => { // Make the handler async
  try {
    const { title, description, dueDate, status } = req.body;
    if (!title || !dueDate || !status) {
      return res.status(400).send({ message: 'Title, due date, and status are required' });
    }

    // Prepare the new task data
    const newTask = {
      title,
      description: description || null, // Store null if description is not provided
      dueDate,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp() // Add a timestamp
    };

    // Add the new task to the 'tasks' collection
    const docRef = await db.collection('tasks').add(newTask);

    // Send back the newly created task with its ID
    res.status(201).send({ id: docRef.id, ...newTask });

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send({ message: 'Failed to create task', error: error.message });
  }
});

// Endpoint to update a task by ID
// Example: PUT /tasks/1 with body { "title": "Updated Task", "dueDate": "2023-10-02", "status": "completed" }
app.put('/tasks/:id', async (req, res) => { // Make the handler async
  try {
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    // Basic validation: ensure at least one field is being updated
    if (!title && !description && !dueDate && !status) {
      return res.status(400).send({ message: 'No fields provided for update' });
    }

    const taskRef = db.collection('tasks').doc(id);

    // Construct an object with only the fields to be updated
    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (dueDate !== undefined) updatedFields.dueDate = dueDate;
    if (status !== undefined) updatedFields.status = status;

    // Add a timestamp for the update
    updatedFields.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await taskRef.update(updatedFields);

    // Optionally, you can fetch the updated document and send it back
    // For now, let's send a success message or just the updated fields information
    res.status(200).send({ message: 'Task updated successfully', id: id, changes: updatedFields });

  } catch (error) {
    console.error("Error updating task:", error);
    // Check if the error is because the document was not found
    if (error.code === 5) { // Firestore error code for NOT_FOUND
        return res.status(404).send({ message: 'Task not found' });
    }
    res.status(500).send({ message: 'Failed to update task', error: error.message });
  }
});

// Endpoint to delete a task by ID
// Example: DELETE /tasks/1
app.delete('/tasks/:id', async (req, res) => { // Make the handler async
  try {
    const { id } = req.params;
    const taskRef = db.collection('tasks').doc(id);

    // Check if the document exists before attempting to delete (optional, but good practice)
    // const doc = await taskRef.get();
    // if (!doc.exists) {
    //   return res.status(404).send({ message: 'Task not found' });
    // }

    await taskRef.delete();

    res.status(200).send({ message: 'Task deleted successfully', id: id });

  } catch (error) {
    console.error("Error deleting task:", error);
    // Firestore delete operation doesn't typically error if the doc doesn't exist,
    // but other errors could occur.
    // If you explicitly check for existence first (as in commented code above),
    // the NOT_FOUND error handling might be different.
    res.status(500).send({ message: 'Failed to delete task', error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});