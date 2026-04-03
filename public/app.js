const API_BASE_URL = '/api';

const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const tasksList = document.getElementById('tasksList');
const taskCount = document.getElementById('taskCount');
const appStatus = document.getElementById('appStatus');

let tasks = [];

async function fetchTasks() {
  appStatus.textContent = 'Loading...';
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to load tasks');
    tasks = await res.json();
    renderTasks();
    appStatus.textContent = 'Online';
  } catch (error) {
    appStatus.textContent = 'Offline';
    tasksList.innerHTML = '<div class="empty-state">Unable to load tasks. Check connectivity.</div>';
    taskCount.textContent = '0 tasks';
  }
}

async function createTask(title, description) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error('Failed to create task');

    taskTitle.value = '';
    taskDescription.value = '';
    await fetchTasks();
  } catch (error) {
    alert('There was an error creating the task.');
  }
}

async function updateStatus(id, currentStatus) {
  const nextStatus = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' }[currentStatus];
  await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: nextStatus }),
  });
  await fetchTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
  await fetchTasks();
}

function renderTasks() {
  taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-state">No tasks yet. Add one above.</div>';
    return;
  }

  tasksList.innerHTML = tasks
    .map(task => `
      <article class="task-card">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="status-row">
          <span>${task.status.replace('-', ' ')}</span>
          <div class="task-actions">
            <button class="action-btn status" onclick="updateStatus('${task.id}', '${task.status}')">${task.status === 'completed' ? 'Reset' : 'Next'}</button>
            <button class="action-btn delete" onclick="deleteTask('${task.id}')">Delete</button>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();

  if (!title) {
    alert('Please provide a task title.');
    return;
  }

  await createTask(title, description);
});

fetchTasks();
