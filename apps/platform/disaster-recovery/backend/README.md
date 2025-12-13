# Disaster Recovery Documentation System - Backend

Python FastAPI backend for the DR documentation system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## Running Tests

```bash
pytest
```

## Project Structure

- `models/` - Data models and domain entities
- `services/` - Business logic layer
- `repositories/` - Data persistence layer
- `api/` - FastAPI endpoints and routing
- `tests/` - Test suite including property-based tests
