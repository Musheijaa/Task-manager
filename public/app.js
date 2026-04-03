const API_BASE_URL = '/api';

let tasks = [];
let statusFilterValue = 'all';
let searchTerm = '';

const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskStatus = document.getElementById('taskStatus');
const tasksList = document.getElementById('tasksList');
const taskCount = document.getElementById('taskCount');
const taskStats = document.getElementById('taskStats');
const appStatus = document.getElementById('appStatus');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const clearFilterBtn = document.getElementById('clearFilter');

async function fetchTasks() {
  appStatus.textContent = 'Loading...';
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    tasks = await response.json();
    appStatus.textContent = 'Connected';
    renderTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    appStatus.textContent = 'Offline';
    tasksList.innerHTML = '<div class="loading">Failed to load tasks</div>';
    taskCount.textContent = '0 tasks';
    taskStats.textContent = 'Total: 0 | Pending: 0 | In-progress: 0 | Completed: 0';
  }
}

async function createTask(title, description, status = 'pending') {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, status }),
    });

    if (!response.ok) throw new Error('Failed to create task');

    taskTitle.value = '';
    taskDescription.value = '';
    taskStatus.value = 'pending';
    await fetchTasks();
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task');
  }
}

async function updateTask(id, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update task');

    await fetchTasks();
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task');
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete task');

    await fetchTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

function getNextStatus(currentStatus) {
  const statusFlow = {
    'pending': 'in-progress',
    'in-progress': 'completed',
    'completed': 'pending',
  };
  return statusFlow[currentStatus] || 'pending';
}

function getStatusButtonText(currentStatus) {
  const buttonText = {
    'pending': 'Start',
    'in-progress': 'Complete',
    'completed': 'Restart',
  };

  return buttonText[currentStatus] || 'Update';
}

function filteredTasks() {
  return tasks.filter((task) => {
    const matchesStatus = statusFilterValue === 'all' || task.status === statusFilterValue;
    const matchesSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });
}

function renderTasks() {
  const list = filteredTasks();
  taskCount.textContent = `${list.length} task${list.length !== 1 ? 's' : ''}`;

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  taskStats.textContent = `Total: ${total} | Pending: ${pending} | In-progress: ${inProgress} | Completed: ${completed}`;

  if (list.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No tasks found</h3>
        <p>Try adding tasks or adjusting filters.</p>
      </div>
    `;
    return;
  }

  tasksList.innerHTML = list.map(task => `
    <div class="task-card">
      <div class="task-header">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <span class="status-badge status-${task.status}">${task.status.replace('-', ' ')}</span>
      </div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-actions">
        <button class="btn btn-small btn-secondary" onclick="toggleStatus('${task.id}', '${task.status}')">${getStatusButtonText(task.status)}</button>
        <button class="btn btn-small btn-secondary" onclick="editTask('${task.id}')">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteTask('${task.id}')">Delete</button>
      </div>
      <div class="task-meta">
        Created ${formatDate(task.created_at)}
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleStatus(id, currentStatus) {
  const nextStatus = getNextStatus(currentStatus);
  updateTask(id, { status: nextStatus });
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = prompt('Edit task title', task.title);
  if (newTitle === null) return;

  const newDescription = prompt('Edit task description', task.description || '');
  if (newDescription === null) return;

  const newStatus = prompt('Edit task status (pending, in-progress, completed)', task.status);
  if (newStatus === null) return;

  if (!newTitle.trim()) {
    alert('Title cannot be empty');
    return;
  }

  const normalizedStatus = ['pending', 'in-progress', 'completed'].includes(newStatus.trim().toLowerCase()) ? newStatus.trim().toLowerCase() : task.status;

  updateTask(id, { title: newTitle.trim(), description: newDescription.trim(), status: normalizedStatus });
}

statusFilter.addEventListener('change', (e) => {
  statusFilterValue = e.target.value;
  renderTasks();
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase();
  renderTasks();
});

refreshBtn.addEventListener('click', fetchTasks);

clearFilterBtn.addEventListener('click', () => {
  statusFilterValue = 'all';
  statusFilter.value = 'all';
  searchTerm = '';
  searchInput.value = '';
  taskTitle.value = '';
  taskDescription.value = '';
  taskStatus.value = 'pending';
  renderTasks();
});

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const status = taskStatus.value;

  if (!title) {
    alert('Task title is required.');
    return;
  }

  await createTask(title, description, status);
});

fetchTasks();
