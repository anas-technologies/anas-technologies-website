
    # ANAS Technologies — Backend

Backend API for the ANAS Technologies website, built with Node.js, Express.js and PostgreSQL.

## Requirements

- Node.js and npm
- PostgreSQL (version 18 recommended)
- pgAdmin 4 (recommended for database management)

## 1. Install Dependencies

Open a terminal inside the backend folder and run:

```bash
npm install
```

## 2. Configure PostgreSQL

Create a PostgreSQL database named:

`anas_technologies`

Restore the database structure using:

`database/anas_database_schema.backup`

In pgAdmin 4:

1. Create the empty database.
2. Right-click the database and select Restore.
3. Select the backup file and choose Custom format.
4. Run Restore and verify that all four tables exist.

The backup contains the database structure only, not existing form submissions.

## 3. Configure Environment Variables

Copy `.env.example` to a new file named `.env`.

Configure the following variables:

- PORT — Backend port, default 5000
- DB_HOST — PostgreSQL server hostname
- DB_PORT — PostgreSQL port, default 5432
- DB_NAME — Database name
- DB_USER — PostgreSQL username
- DB_PASSWORD — PostgreSQL password
- JWT_SECRET — Strong, randomly generated JWT signing secret
- ADMIN_PASSWORD_HASH — bcrypt hash of the administrator password
- SMTP_USER — Gmail account used for notifications
- SMTP_PASS — Gmail App Password
- NOTIFICATION_EMAIL — Destination for form notifications

Never commit `.env` or share real credentials publicly.

## 4. Start the Backend

```bash
npm start
```

Default local address:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

## 5. API Endpoints

### Public

- POST /api/contact
- POST /api/quote
- POST /api/careers
- POST /api/newsletter
- GET /api/health

### Administrator

- POST /api/admin/login
- GET /api/admin/contacts
- GET /api/admin/quotes
- GET /api/admin/careers
- GET /api/admin/careers/:id/cv
- GET /api/admin/newsletter

Administrator data endpoints require a valid bearer token.

## 6. Security

- Admin password verification using bcrypt
- JWT-based administrator authentication
- Login and public form rate limiting
- Helmet HTTP security headers
- Configured CORS origins
- CV format and file size validation
- Parameterized PostgreSQL queries
- Private CV storage

## 7. Deployment Notes

- Update allowed frontend origins in `server.js` to include the actual production HTTPS domain.
- Configure production environment variables and database credentials.
- Configure HTTPS and secure hosting.
- Keep uploaded CV files private and persistent.
- Use a persistent rate-limit store if running multiple backend instances.
- Configure and verify the website owner's SMTP credentials.
- Set up database backups and appropriate access permissions.
- Replace development secrets before deployment.

## 8. Files Excluded From Version Control

Do not upload:

- `.env`
- `node_modules/`
- `uploads/` containing private CVs

The `.env.example` template and schema-only database backup can be included in the project handover.

