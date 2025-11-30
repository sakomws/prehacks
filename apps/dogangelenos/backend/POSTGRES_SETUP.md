# PostgreSQL Setup Guide

## Option 1: Using Docker (Recommended)

### Start PostgreSQL with Docker Compose

```bash
cd apps/dogangelenos/backend
docker-compose up -d postgres
```

This will:
- Start PostgreSQL on port 5432
- Create database `dogangelenos`
- Username: `postgres`
- Password: `password`

### Initialize Database

```bash
python init_db.py
```

### Start API with Docker

```bash
docker-compose up -d
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f api
docker-compose logs -f postgres
```

## Option 2: Local PostgreSQL Installation

### macOS (Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows

Download from: https://www.postgresql.org/download/windows/

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dogangelenos;

# Create user (optional)
CREATE USER dogangelenos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dogangelenos TO dogangelenos_user;

# Exit
\q
```

### Update .env

```bash
cd apps/dogangelenos/backend
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/dogangelenos
```

### Initialize Database

```bash
python init_db.py
```

### Run API

```bash
python main.py
```

## Database Management

### Connect to Database

```bash
# Using psql
psql -U postgres -d dogangelenos

# Using Docker
docker exec -it dogangelenos-db psql -U postgres -d dogangelenos
```

### Common SQL Commands

```sql
-- List tables
\dt

-- View bookings
SELECT * FROM bookings;

-- View users
SELECT * FROM users;

-- Count bookings
SELECT COUNT(*) FROM bookings;

-- View recent bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Update booking status
UPDATE bookings SET status = 'confirmed' WHERE id = 1;

-- Delete a booking
DELETE FROM bookings WHERE id = 1;
```

### Backup Database

```bash
# Local PostgreSQL
pg_dump -U postgres dogangelenos > backup.sql

# Docker
docker exec dogangelenos-db pg_dump -U postgres dogangelenos > backup.sql
```

### Restore Database

```bash
# Local PostgreSQL
psql -U postgres dogangelenos < backup.sql

# Docker
docker exec -i dogangelenos-db psql -U postgres dogangelenos < backup.sql
```

## Database Migrations (Alembic)

### Initialize Alembic

```bash
alembic init alembic
```

### Create Migration

```bash
alembic revision --autogenerate -m "Add new column"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

## Troubleshooting

### Connection Refused

Check if PostgreSQL is running:
```bash
# Local
pg_isready

# Docker
docker ps | grep postgres
```

### Permission Denied

Grant permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE dogangelenos TO postgres;
```

### Port Already in Use

Change port in docker-compose.yml:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead
```

Update DATABASE_URL:
```
DATABASE_URL=postgresql://postgres:password@localhost:5433/dogangelenos
```

### Reset Database

```bash
# Drop and recreate
docker-compose down -v
docker-compose up -d postgres
python init_db.py
```

## Production Considerations

### Use Environment Variables

Never commit passwords! Use:
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Enable SSL

```python
DATABASE_URL = "postgresql://user:pass@host:5432/db?sslmode=require"
```

### Connection Pooling

Update database.py:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0
)
```

### Monitoring

- Use pgAdmin: https://www.pgadmin.org/
- Monitor with pg_stat_statements
- Set up automated backups

## Cloud PostgreSQL

### Heroku Postgres

```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku config:get DATABASE_URL
```

### AWS RDS

1. Create RDS PostgreSQL instance
2. Update security groups
3. Use connection string in .env

### Supabase

1. Create project at https://supabase.com
2. Get connection string from Settings > Database
3. Update .env

### Railway

1. Create project at https://railway.app
2. Add PostgreSQL service
3. Copy DATABASE_URL

## Performance Tips

1. **Indexes**: Add indexes for frequently queried columns
2. **Connection Pooling**: Use pgbouncer for high traffic
3. **Monitoring**: Track slow queries
4. **Backups**: Automate daily backups
5. **Scaling**: Use read replicas for heavy read loads

## Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- Alembic Docs: https://alembic.sqlalchemy.org/
