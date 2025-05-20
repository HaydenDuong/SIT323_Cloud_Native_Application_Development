// This script fetches tasks from the server and displays them in the task list
const taskListElement = document.getElementById('tasks'); // Get reference to the task list
const taskForm = document.getElementById('task-form');
const submitButton = taskForm.querySelector('button[type="submit"]');

let currentEditTaskId = null;
let allTasks = []; // To store the fetched tasks for easy lookup

fetch('http://34.129.213.124/tasks')
  .then(response => response.json())
  .then(tasks => {
    allTasks = tasks; // Store tasks globally
    renderTasks(allTasks, taskListElement);
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
      // Add data attributes to the edit button for easier form population
      div.innerHTML = `
        ${task.title} - Description: ${task.description || 'N/A'} - Due: ${task.dueDate} - ${task.status}
        <button type="button" class="edit-button" data-id="${task.id}" data-title="${task.title}" data-description="${task.description || ''}" data-duedate="${task.dueDate}" data-status="${task.status}">Edit</button>
        <button type="button" class="delete-button" data-id="${task.id}">Delete</button>
      `;
      taskList.appendChild(div);
  });
}

// Event Listener for delete and edit buttons
taskListElement.addEventListener('click', async (e) => {
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
        const updatedTasksResponse = await fetch('http://34.129.213.124/tasks');
        allTasks = await updatedTasksResponse.json();
        renderTasks(allTasks, taskListElement);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from server.' }));
        console.error('Failed to delete task. Server response:', response.status, errorData);
        alert(`Failed to delete task: ${errorData.message || 'Unknown error from server'}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. See console for details.');
    }
  } else if (e.target.classList.contains('edit-button')) {
    const button = e.target;
    currentEditTaskId = button.getAttribute('data-id');

    document.getElementById('title').value = button.getAttribute('data-title');
    document.getElementById('description').value = button.getAttribute('data-description');
    
    // Assuming dueDate is already in 'yyyy-MM-dd' format from data attribute
    document.getElementById('dueDate').value = button.getAttribute('data-duedate');
    document.getElementById('status').value = button.getAttribute('data-status');

    if (submitButton) submitButton.textContent = 'Update Task';
    document.getElementById('title').focus(); // Focus on the first field
  }
});


// Event Listener for "Add Task" / "Update Task" form submission
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const taskData = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value,
    status: document.getElementById('status').value,
  };

  if (!taskData.title || !taskData.dueDate || !taskData.status) {
    alert('Please fill in all required fields');
    return;
  }

  let response;
  // let successMessage = ''; // Not used directly in alert

  try {
    if (currentEditTaskId) {
      // Edit mode
      response = await fetch(`http://34.129.213.124/tasks/${currentEditTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      // successMessage = 'Task updated successfully!'; // For optional alert
    } else {
      // Add mode
      response = await fetch('http://34.129.213.124/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      // successMessage = 'Task added successfully!'; // For optional alert
    }

    if (response.ok) {
      const updatedTasksResponse = await fetch('http://34.129.213.124/tasks');
      allTasks = await updatedTasksResponse.json();
      renderTasks(allTasks, taskListElement);
      
      taskForm.reset();
      const wasEditing = !!currentEditTaskId; // Check if we were in edit mode
      currentEditTaskId = null; 
      if (submitButton) submitButton.textContent = 'Add Task';
      
      if (!wasEditing) { // Only scroll if adding a new task (not after editing)
           taskListElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

    } else {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.'}));
      alert(`Operation failed: ${errorData.message || 'Unknown server error'}`);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error submitting form. Please see console for details.');
  }
});
