# Task Manager

A professional task management web application built with Node.js, Express, and PostgreSQL. This project is prepared for Railway PaaS deployment and includes full CRUD, secure environment management, and a styled UX.

## Assignment: Practical Application of PaaS with Railway

### Deliverables included in this repo
- Deployed app URL: *(add your Railway URL after deployment)*
- Source code repo: *(your GitHub link)*
- Database schema + sample data: `schema.sql` + seed example in docs
- Documentation report: `RAILWAY_REPORT.md` (2–3 pages reflect deployment, challenges, comparison)

### Learning objective mapping
1. Application deployment on Railway: `index.js`, `Procfile`, Railway config
2. Environment configuration: `.env.example`, secure `DATABASE_URL` usage
3. Database integration: `schema.sql`, PostgreSQL methods in backend
4. Scalability awareness: section below
5. CI/CD workflow: Railway GitHub integration recommended
6. Monitoring/logging: Railway logs (see `RAILWAY_REPORT.md`)
7. Documentation/reflection: this README + report file

## Features

- Create, read, update, and delete tasks
- Track task status (pending, in-progress, completed)
- Clean and responsive UI
- RESTful API architecture
- PostgreSQL database with Row Level Security

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Frontend**: HTML, CSS, JavaScript (vanilla)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (or Supabase account)

## Setup

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database connection string:
```
DATABASE_URL=your_postgresql_connection_string
PORT=3000
NODE_ENV=development
```

5. Set up the database schema:
```bash
psql $DATABASE_URL -f schema.sql
```

6. Start the application:
```bash
node index.js
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Deployment to Railway

1. Create a new project on [Railway](https://railway.app)

2. Add a PostgreSQL database to your project

3. Connect your GitHub repository

4. Railway will automatically detect the `Procfile` and deploy your application

5. Add the `DATABASE_URL` environment variable (Railway automatically provides this when you add PostgreSQL)

6. Your app will be live at the provided Railway URL

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Port number (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
.
├── index.js              # Express server and API endpoints
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styling
│   └── app.js            # Frontend JavaScript
├── schema.sql            # Database schema
├── .env.example          # Environment variables template
├── Procfile              # Railway deployment configuration
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## License

MIT
