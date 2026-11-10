const API_URL = 'http://127.0.0.1:5000/api/tasks';

// Fetch and display all tasks
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        showAlert('Backend not connected yet.', 'warning');
    }
}

// Render list items in HTML
function renderTasks(tasks) {
    const listEl = document.getElementById('taskList');
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

// Add a new task
async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, completed: false })
        });

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
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !currentStatus })
        });
        if (response.ok) loadTasks();
    } catch (error) {
        showAlert('Server error.', 'danger');
    }
}

// Delete task
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
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
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.classList.remove('d-none');
    setTimeout(() => alertEl.classList.add('d-none'), 3000);
}

document.addEventListener('DOMContentLoaded', loadTasks);