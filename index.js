require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const { randomUUID } = require('crypto');
const { Low, JSONFile } = require('lowdb');

const app = express();
const PORT = process.env.PORT || 3000;

const usePostgres = !!process.env.DATABASE_URL && process.env.USE_SIMPLE_DB !== 'true';
let pool;
let db;

async function initDataStore() {
  if (usePostgres) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('Using PostgreSQL store.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text DEFAULT '',
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
        created_at timestamptz DEFAULT now()
      );
    `);
  } else {
    const file = path.join(__dirname, 'db.json');
    const adapter = new JSONFile(file);
    db = new Low(adapter);
    await db.read();
    db.data = db.data || { tasks: [] };
    await db.write();
    console.log('Using simple JSON store (lowdb).');
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', datastore: usePostgres ? 'postgres' : 'json' });
});

app.get('/api/tasks', async (req, res) => {
  try {
    if (usePostgres) {
      const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    const tasks = [...(db.data.tasks || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (usePostgres) {
      const result = await pool.query(
        'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
        [title.trim(), description || '', 'pending']
      );
      return res.status(201).json(result.rows[0]);
    }

    const newTask = {
      id: randomUUID(),
      title: title.trim(),
      description: (description || '').trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    db.data.tasks.unshift(newTask);
    await db.write();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (usePostgres) {
      const result = await pool.query(
        'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 RETURNING *',
        [title, description, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.json(result.rows[0]);
    }

    const task = db.data.tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;

    await db.write();
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (usePostgres) {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.json({ message: 'Task deleted successfully' });
    }

    const initialLength = db.data.tasks.length;
    db.data.tasks = db.data.tasks.filter((t) => t.id !== id);

    if (db.data.tasks.length === initialLength) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.write();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
  await initDataStore();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();