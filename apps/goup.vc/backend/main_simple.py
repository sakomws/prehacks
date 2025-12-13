from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Goup.vc Event Management Platform API",
    description="A comprehensive event and community calendar platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Goup.vc Event Management Platform API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "goup.vc-api"}


@app.get("/api/v1/events")
async def get_events():
    # Mock data for now
    return {
        "events": [
            {
                "id": "1",
                "title": "Sample Event",
                "description": "This is a sample event",
                "start_time": "2024-01-15T10:00:00Z",
                "end_time": "2024-01-15T12:00:00Z",
                "location": "Sample Location"
            }
        ]
    }


@app.get("/api/v1/calendars")
async def get_calendars():
    # Mock data for now
    return {
        "calendars": [
            {
                "id": "1",
                "name": "Sample Calendar",
                "description": "This is a sample calendar",
                "owner": "Sample Owner"
            }
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )