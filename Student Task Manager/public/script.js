// This script fetches tasks from the server and displays them in the task list
const taskListElement = document.getElementById('tasks'); // Get reference to the task list

fetch('http://34.129.213.124/tasks')
  .then(response => response.json())
  .then(tasks => {
    renderTasks(tasks, taskListElement);
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
      div.innerHTML = `
        ${task.title} - Description: ${task.description || 'N/A'} - Due: ${task.dueDate} - ${task.status}
        <button type="button" class="delete-button" data-id="${task.id}">Delete</button>
      `;
      taskList.appendChild(div);
  });
}

// Event Listener for "delete" button
taskListElement.addEventListener('click', async (e) => {
  // Check if the clicked element has the class 'delete-button'
  if (e.target.classList.contains('delete-button')) {
    const id = e.target.getAttribute('data-id');
    if (!id) {
      console.error("Delete button clicked, but 'data-id' attribute is missing or empty.");
      alert("Could not delete task: Task ID is missing.");
      return;
    }

    try {
      const response = await fetch(`http://34.129.213.124/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Task deleted successfully, re-fetch and re-render tasks
        const updatedTasksResponse = await fetch('http://34.129.213.124/tasks');
        const updatedTasks = await updatedTasksResponse.json();
        renderTasks(updatedTasks, taskListElement); // Render the updated task list
      } else {
        // Handle errors, e.g., task not found or server error
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from server.' }));
        console.error('Failed to delete task. Server response:', response.status, errorData);
        alert(`Failed to delete task: ${errorData.message || 'Unknown error from server'}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. See console for details.');
    }
  }
});


// Event Listener for "Add Task" button
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
    const response = await fetch('http://34.129.213.124/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (response.ok) {
      const updatedTasksResponse = await fetch('http://34.129.213.124/tasks'); // Fetch updated tasks
      const updatedTasks = await updatedTasksResponse.json(); // Get the updated tasks
      renderTasks(updatedTasks, taskListElement); // Render the new task
      document.getElementById('task-form').reset(); // Reset the form

      //
      taskListElement.scrollIntoView({ behavior: 'smooth', block: 'end' }); // Scroll to the task list
    } else {
      const errorData = await response.json();
      alert(`Failed to add task: ${errorData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Error adding task');
  }
});
