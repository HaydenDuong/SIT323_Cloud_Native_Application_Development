// This script fetches tasks from the server and displays them in the task list
fetch('http://localhost:8080/tasks')
  .then(response => response.json())
  .then(tasks => {
    const taskList = document.getElementById('tasks');
    renderTasks(tasks, taskList);
})
.catch(error => {
    console.error('Error fetching tasks:', error);
    alert('Error fetching tasks');
});

// Function to render tasks in the task list
function renderTasks(tasks, taskList) {
  taskList.innerHTML = ''; // Clear existing tasks  
  tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task';
      div.textContent = `${task.title} - Description: ${task.description || 'N/A'} - Due: ${task.dueDate} - ${task.status}`;
      taskList.appendChild(div);
  });
}

// Hanling form submission to create a new task
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Get form values
  const task = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value,
    status: document.getElementById('status').value,
  };

  // Validate form values
  if (!task.title || !task.dueDate || !task.status) {
    alert('Please fill in all required fields');
    return;
  }

  // Send POST request to create a new task
  try {
    const response = await fetch('http://localhost:8080/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (response.ok) {
      const updatedTasksResponse = await fetch('http://localhost:8080/tasks'); // Fetch updated tasks
      const updatedTasks = await updatedTasksResponse.json(); // Get the updated tasks
      const taskList = document.getElementById('tasks');
      renderTasks(updatedTasks, taskList); // Render the new task
      document.getElementById('task-form').reset(); // Reset the form
    } else {
      const errorData = await response.json();
      alert('Failed to add task: ${errorData.message || Unknown error}');
    }
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Error adding task');
  }
});
