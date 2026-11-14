const API_URL = 'http://127.0.0.1:5000/api/tasks';

// 1. Function to Log In and Save Token
async function loginUser(username, password) {
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt_token', data.token); // Save token securely in browser
            showAlert('Logged in successfully!', 'success');
            loadTasks(); // Load tasks after successful login
        } else {
            showAlert('Invalid username or password.', 'danger');
        }
    } catch (error) {
        showAlert('Could not connect to login server.', 'danger');
    }
}

// Fetch and display all tasks (Now includes the token!)
async function loadTasks() {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
        showAlert('Please log in first to view tasks.', 'warning');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Passing the JWT token here
            }
        });

        if (response.status === 401) {
            showAlert('Session expired or unauthorized. Please log in again.', 'danger');
            return;
        }

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        showAlert('Backend not connected yet.', 'warning');
    }
}

// Render list items in HTML
function renderTasks(tasks) {
    const listEl = document.getElementById('taskList');
    if (!listEl) return;
    listEl.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span style="cursor: pointer; text-decoration: ${task.completed ? 'line-through' : 'none'}" 
                  onclick="toggleTask(${task.id}, ${task.completed})">
                ${task.title}
            </span>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
        `;
        listEl.appendChild(li);
    });
}

// Add a new task (Now includes the token!)
async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showAlert('Please log in first.', 'warning');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Passing the JWT token here
            },
            body: JSON.stringify({ title: title, completed: false })
        });

        if (response.status === 401) {
            showAlert('Unauthorized. Please log in.', 'danger');
            return;
        }

        if (response.ok) {
            input.value = '';
            showAlert('Task added successfully!', 'success');
            loadTasks();
        }
    } catch (error) {
        showAlert('Server error.', 'danger');
    }
}

// Toggle completion status
async function toggleTask(id, currentStatus) {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: !currentStatus })
        });
        if (response.ok) loadTasks();
    } catch (error) {
        showAlert('Server error.', 'danger');
    }
}

// Delete task
async function deleteTask(id) {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showAlert('Task deleted.', 'warning');
            loadTasks();
        }
    } catch (error) {
        showAlert('Server error.', 'danger');
    }
}

function showAlert(message, type) {
    const alertEl = document.getElementById('statusAlert');
    if (!alertEl) return;
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.classList.remove('d-none');
    setTimeout(() => alertEl.classList.add('d-none'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Automatically try to load tasks if token exists
    loadTasks();
});