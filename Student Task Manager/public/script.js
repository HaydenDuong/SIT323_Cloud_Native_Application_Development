// --- DOM Element References & Global State ---
const authStatus = document.getElementById('auth-status');
const signInButton = document.getElementById('sign-in-google-button');
const signOutButton = document.getElementById('sign-out-button');
const taskManagementSection = document.getElementById('task-management-section');
const taskListElement = document.getElementById('tasks');
const taskForm = document.getElementById('task-form');
const submitButton = taskForm ? taskForm.querySelector('button[type="submit"]') : null;

let currentIdToken = null; 
let currentEditTaskId = null;
let allTasks = [];

// --- Firebase Auth SDK Functions (expected on window object from index.html) ---
const auth = window.firebaseAuth;
const googleAuthProvider = window.googleAuthProvider;
const signInWithPopup = window.firebaseSignInWithPopup;
const onAuthStateChanged = window.firebaseOnAuthStateChanged;
const firebaseSignOut = window.firebaseSignOutFunction;

// --- Authentication Functions ---
const signInWithGoogle = () => {
  if (!auth || !googleAuthProvider || !signInWithPopup) {
    console.error("Firebase Auth functions not available. Check Firebase setup in index.html.");
    alert("Authentication service is not ready. Please try again later.");
    return;
  }
  signInWithPopup(auth, googleAuthProvider)
    .then((result) => {
      console.log("Sign-in successful via popup. Auth state change will trigger further actions.");
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Sign-in cancelled.');
      } else if (error.code === 'auth/network-request-failed') {
        alert('Network error during sign-in. Please check connection.');
      } else {
        alert(`Sign-in failed: ${error.message}`);
      }
    });
};

const signOutUser = () => {
  if (!auth || !firebaseSignOut) {
    console.error("Firebase Auth or signOut function not available.");
    return;
  }
  firebaseSignOut(auth).then(() => {
    console.log("User signed out successfully. Auth state change will trigger UI updates.");
  }).catch((error) => {
    console.error("Sign Out Error:", error);
    alert(`Sign-out failed: ${error.message}`);
  });
};

// --- Auth State Change Listener (Core Logic) ---
if (auth && onAuthStateChanged) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      if(authStatus) authStatus.textContent = `Hello, ${user.displayName || user.email}!`;
      if(signInButton) signInButton.style.display = 'none';
      if(signOutButton) signOutButton.style.display = 'inline-block';
      if(taskManagementSection) taskManagementSection.style.display = 'block';
      try {
        currentIdToken = await user.getIdToken();
        console.log("User ID Token retrieved for API calls.");
        fetchAndRenderTasks(); 
      } catch (error) {
        console.error("Error getting ID token:", error);
        if(authStatus) authStatus.textContent = 'Error retrieving user session. Please sign out and try again.';
        currentIdToken = null;
        if(taskManagementSection) taskManagementSection.style.display = 'none';
        if(signOutButton) signOutButton.style.display = 'inline-block'; 
      }
    } else {
      // User is signed out
      if(authStatus) authStatus.textContent = 'Please sign in to manage tasks.';
      if(signInButton) signInButton.style.display = 'inline-block';
      if(signOutButton) signOutButton.style.display = 'none';
      if(taskManagementSection) taskManagementSection.style.display = 'none';
      if(taskListElement) taskListElement.innerHTML = '<p>Signed out. No tasks to display.</p>'; 
      allTasks = []; 
      currentIdToken = null;
      currentEditTaskId = null; // Reset edit mode on logout
      if(taskForm) taskForm.reset(); // Reset form on logout
      if(submitButton) submitButton.textContent = 'Add Task'; // Reset button text
      console.log("No user signed in. UI reset.");
    }
  });
} else {
  console.error("Firebase onAuthStateChanged or auth is not available. Auth state will not be monitored.");
  if(authStatus) authStatus.textContent = "Authentication service error. Check console.";
}

// --- Event Listeners for Auth Buttons ---
if (signInButton) signInButton.addEventListener('click', signInWithGoogle);
if (signOutButton) signOutButton.addEventListener('click', signOutUser);

// --- Task Management Functions (Now Auth-Aware) ---

async function fetchAndRenderTasks() {
  if (!currentIdToken) {
    if(taskListElement) taskListElement.innerHTML = '<p>Please sign in to view tasks.</p>';
    return;
  }
  console.log("Fetching tasks...");
  try {
    const response = await fetch('http://34.129.213.124/tasks', {
      headers: { /* 'Authorization': `Bearer ${currentIdToken}` // Add when backend ready */ }
    });
    if (!response.ok) {
      let errorMsg = `<p>Could not load tasks (Status: ${response.status})</p>`;
      if (response.status === 401 || response.status === 403) {
        errorMsg = '<p>Session expired or unauthorized. Please sign in again.</p>';
      }
      if(taskListElement) taskListElement.innerHTML = errorMsg;
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    const tasks = await response.json();
    allTasks = tasks;
    renderTasks(allTasks, taskListElement);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    if (taskListElement && !taskListElement.innerHTML.includes('Please sign in')) {
        taskListElement.innerHTML = '<p>Error fetching tasks. See console.</p>';
    }
  }
}

function renderTasks(tasks, taskList) {
  if (!taskList) return; 
  taskList.innerHTML = ''; 
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = '<p>No tasks yet. Add one below!</p>';
    return;
  }
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML = `
      ${task.title} - Description: ${task.description || 'N/A'} - Due: ${task.dueDate} - ${task.status}
      <button type="button" class="edit-button" data-id="${task.id}" data-title="${task.title}" data-description="${task.description || ''}" data-duedate="${task.dueDate}" data-status="${task.status}">Edit</button>
      <button type="button" class="delete-button" data-id="${task.id}">Delete</button>
    `;
    taskList.appendChild(div);
  });
}

if (taskListElement) {
  taskListElement.addEventListener('click', async (e) => {
    if (!currentIdToken) {
      alert("Please sign in to modify tasks.");
      return;
    }
    const targetButton = e.target.closest('button');
    if (!targetButton) return;
    const id = targetButton.getAttribute('data-id');
    if (!id) return;

    if (targetButton.classList.contains('delete-button')) {
      if (!confirm("Are you sure you want to delete this task?")) return;
      try {
        const response = await fetch(`http://34.129.213.124/tasks/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' /* 'Authorization': `Bearer ${currentIdToken}` */ }
        });
        if (response.ok) fetchAndRenderTasks(); 
        else {
          const errorData = await response.json().catch(() => ({ message: 'Server error.'}));
          alert(`Failed to delete task: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        alert('Error deleting task. See console.');
      }
    } else if (targetButton.classList.contains('edit-button')) {
      currentEditTaskId = id;
      const titleEl = document.getElementById('title');
      const descriptionEl = document.getElementById('description');
      const dueDateEl = document.getElementById('dueDate');
      const statusEl = document.getElementById('status');
      if(titleEl) titleEl.value = targetButton.getAttribute('data-title');
      if(descriptionEl) descriptionEl.value = targetButton.getAttribute('data-description');
      if(dueDateEl) dueDateEl.value = targetButton.getAttribute('data-duedate');
      if(statusEl) statusEl.value = targetButton.getAttribute('data-status');
      if (submitButton) submitButton.textContent = 'Update Task';
      if(titleEl) titleEl.focus();
    }
  });
}

if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentIdToken) {
      alert("Please sign in to manage tasks.");
      return;
    }
    const titleEl = document.getElementById('title');
    const descriptionEl = document.getElementById('description');
    const dueDateEl = document.getElementById('dueDate');
    const statusEl = document.getElementById('status');
    const taskData = {
      title: titleEl ? titleEl.value : '',
      description: descriptionEl ? descriptionEl.value : '',
      dueDate: dueDateEl ? dueDateEl.value : '',
      status: statusEl ? statusEl.value : 'pending',
    };
    if (!taskData.title || !taskData.dueDate || !taskData.status) {
      alert('Please fill in all required fields (Title, Due Date, Status).');
      return;
    }
    let url = 'http://34.129.213.124/tasks';
    let method = 'POST';
    if (currentEditTaskId) {
      url += `/${currentEditTaskId}`;
      method = 'PUT';
    }
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' /* 'Authorization': `Bearer ${currentIdToken}` */ },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        fetchAndRenderTasks(); 
        taskForm.reset();
        const wasEditing = !!currentEditTaskId;
        currentEditTaskId = null;
        if (submitButton) submitButton.textContent = 'Add Task';
        if (!wasEditing && taskListElement) taskListElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Server error.'}));
        alert(`Operation failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      alert('Error submitting form. See console.');
    }
  });
}

console.log("Student Task Manager script loaded. Auth listeners active if Firebase SDKs initialized correctly.");
