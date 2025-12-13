# Goup.vc Event Management Platform - Currently Running

## 🚀 Status: LIVE

### Services Running:
- ✅ **Backend API (FastAPI)** - http://localhost:8001
- ✅ **Frontend (Next.js)** - http://localhost:3000

### Quick Access:
- **Main App:** http://localhost:3000
- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health

### API Endpoints Available:
```bash
# Health check
curl http://localhost:8001/health

# Get sample events
curl http://localhost:8001/api/v1/events

# Get sample calendars
curl http://localhost:8001/api/v1/calendars
```

### Development Commands:
```bash
# Check status
./status.sh

# Stop services (if needed)
# Backend: Stop process ID 3
# Frontend: Stop process ID 4
```

### Next Steps:
1. Visit http://localhost:3000 to see the frontend
2. Visit http://localhost:8001/docs to explore the API
3. Start implementing features from the task list in `.kiro/specs/event-management/tasks.md`

---
*Last updated: $(date)*