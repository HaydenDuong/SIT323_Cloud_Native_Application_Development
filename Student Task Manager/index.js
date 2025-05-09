// Student Task Manager API
// This is a simple Express.js application that manages tasks for students.
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use(express.json());

let tasks = [];

app.get('/', (req, res) => {
  res.send('Student Task Manager API'); 
});

// Endpoint to get all tasks
app.get('/tasks', (req, res) => {
  res.status(200).send(tasks);
});

// Endpoint to create a new task
// Example: POST /tasks with body { "title": "Task 1", "dueDate": "2023-10-01", "status": "pending" }
app.post('/tasks', (req, res) => {
  const {title, description, dueDate, status} = req.body;
  if (!title || !dueDate || !status) {
    return res.status(400).send({ message: 'Title, due date, and status are required' });
  }

  const task = {id: tasks.length + 1, title, description, dueDate, status};
  tasks.push(task);
  res.status(201).send(task);
});

// Endpoint to update a task by ID
// Example: PUT /tasks/1 with body { "title": "Updated Task", "dueDate": "2023-10-02", "status": "completed" }
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, status } = req.body;
  const task = tasks.find(t => t.id == id);

  if (task) {
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.status = status;
    res.status(200).send(tasks);
  }
  else {
    res.status(404).send({ message: 'Task not found' });
  }
});

// Endpoint to delete a task by ID
// Example: DELETE /tasks/1
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  task = tasks.find(t => t.id == id);

  if (task) {
    tasks = tasks.filter(t => t.id != id);
    res.status(200).send('Task deleted successfully');
  } 
  else {
    res.status(404).send({ message: 'Task not found' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});