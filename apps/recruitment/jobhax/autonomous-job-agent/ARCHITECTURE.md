# JHV5 Architecture Documentation

## System Overview

JHV5 is a sophisticated autonomous job application system built on a modular architecture that combines AI agents, browser automation, and real-time monitoring capabilities.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        JHV5 System                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   FastAPI       │  │   Autonomous    │  │   Real Browser  │  │
│  │   Server        │  │   Agent         │  │   Automation    │  │
│  │                 │  │                 │  │                 │  │
│  │ • REST API      │  │ • AI Logic      │  │ • Selenium      │  │
│  │ • Job Queue     │  │ • Form Detection│  │ • Screenshots   │  │
│  │ • Async Proc    │  │ • Field Mapping │  │ • WebSocket     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Monitoring    │  │   WebSocket     │  │   Data Layer    │  │
│  │   Dashboard     │  │   Server        │  │                 │  │
│  │                 │  │                 │  │                 │  │
│  │ • React UI      │  │ • Real-time     │  │ • Test Data     │  │
│  │ • Progress      │  │   Updates       │  │ • Artifacts     │  │
│  │ • Screenshots   │  │ • Event Stream  │  │ • Logs          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. FastAPI Server (`main.py`)

**Purpose**: Central API server that orchestrates job application processing.

**Key Features**:
- RESTful API endpoints for job submission
- Async job processing with timeout handling
- Integration with OpenAI for AI agent capabilities
- Comprehensive error handling and logging

**Dependencies**:
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `browser-use`: AI agent framework
- `py_interaction`: Device control interface

**API Endpoints**:
- `POST /apply`: Submit job application
- `GET /health`: Health check

### 2. Autonomous Agent (`autonomous_agent.py`)

**Purpose**: Core AI agent that performs intelligent form filling and navigation.

**Key Features**:
- Form field detection and cataloging
- Semantic mapping of candidate data to form fields
- Multi-page navigation logic
- Comprehensive action logging

**Core Methods**:
- `detect_and_catalog_questions()`: Identifies form fields
- `fill_question()`: Fills individual form fields
- `detect_page_transition()`: Detects page changes
- `run_autonomous_application()`: Main execution loop

**Data Flow**:
1. Load candidate data from JSON
2. Navigate to job application URL
3. Detect and catalog all form questions
4. Map candidate data to form fields semantically
5. Fill all mandatory questions
6. Upload CV if required
7. Navigate to next page
8. Generate comprehensive results

### 3. Real Browser Automation (`real_browser_automation.py`)

**Purpose**: Selenium-based browser automation for real browser control.

**Key Features**:
- Real Chrome/Chromium browser control
- Screenshot capture at key moments
- WebSocket integration for real-time updates
- Visual feedback and monitoring

**Classes**:
- `RealHostDevice`: Device control interface
- `RealBrowser`: Browser automation wrapper
- `WebSocketMonitor`: Real-time monitoring

### 4. Monitoring System

#### Monitor Agent (`monitor_agent.py`)
**Purpose**: Agent with real-time monitoring capabilities.

**Key Features**:
- WebSocket client for real-time updates
- Enhanced logging with monitoring integration
- Progress tracking and status updates

#### Monitoring UI (`monitor-ui/`)
**Purpose**: React-based dashboard for real-time monitoring.

**Components**:
- `ActionLog.tsx`: Real-time action logging
- `ScreenshotGallery.tsx`: Visual progress tracking
- `QuestionTracker.tsx`: Form field detection display
- `Metrics.tsx`: Performance metrics
- `AgentStatus.tsx`: Agent status indicators

### 5. Demo and Testing

#### Demo Script (`demo.py`)
**Purpose**: Comprehensive demonstration of system capabilities.

**Features**:
- Step-by-step form filling demonstration
- Visual progress tracking
- Error handling examples

#### Test Files
- `test_agent.py`: Basic agent functionality tests
- `test_real_browser.py`: Real browser automation tests

## Data Flow

### 1. Job Application Submission

```
User Request → FastAPI Server → Autonomous Agent → Browser Control → Results
     ↓              ↓                ↓                ↓              ↓
  JSON Data    Load Candidate    Detect Fields    Fill Forms    Generate
  (job_url)    Data & CV        & Map Values     & Navigate    Artifacts
```

### 2. Real-Time Monitoring

```
Agent Actions → WebSocket Server → React Dashboard → User Interface
     ↓                ↓                    ↓              ↓
  Action Logs    Real-time Events    Live Updates    Visual Progress
```

## Configuration Management

### Environment Variables

```bash
OPENAI_API_KEY=sk-...           # Required for AI agent
AGENT_MODEL=gpt-4.1-mini        # Optional model selection
DEBUG=1                         # Optional debug mode
```

### Candidate Data Structure

The system expects a standardized JSON structure for candidate information:

```json
{
  "personal_information": { ... },
  "eligibility": { ... },
  "motivation": { ... },
  "experience": { ... },
  "voluntary_disclosures": { ... }
}
```

## Error Handling

### Error Types

1. **Navigation Errors**: Failed page loads, timeouts
2. **Form Detection Errors**: Unable to identify form fields
3. **Data Mapping Errors**: Candidate data doesn't match expected fields
4. **Browser Errors**: Chrome/Chromium issues, WebDriver problems
5. **API Errors**: OpenAI API failures, rate limiting

### Error Recovery

- Automatic retries with exponential backoff
- Fallback strategies for form field detection
- Graceful degradation when optional features fail
- Comprehensive error logging and reporting

## Performance Considerations

### Optimization Strategies

1. **Site-Specific Hints**: Pre-configured selectors for known job sites
2. **Parallel Processing**: Async operations where possible
3. **Caching**: Reuse browser sessions and data
4. **Timeout Management**: Configurable timeouts for different operations

### Resource Management

- Browser session cleanup
- Memory management for large forms
- Screenshot storage optimization
- Log rotation and cleanup

## Security Considerations

### Data Protection

- PII masking in logs and traces
- Secure API key management
- Local data storage only
- No external data transmission except to OpenAI

### Browser Security

- Isolated browser profiles
- No persistent data storage
- Secure WebSocket connections
- Input validation and sanitization

## Scalability

### Horizontal Scaling

- Stateless FastAPI server design
- Independent agent instances
- Load balancer compatibility
- Database-free architecture

### Vertical Scaling

- Configurable resource limits
- Memory-efficient data structures
- Optimized browser automation
- Efficient logging and monitoring

## Integration Points

### External Dependencies

- **OpenAI API**: AI agent capabilities
- **Chrome/Chromium**: Browser automation
- **Selenium**: WebDriver interface
- **WebSocket**: Real-time communication

### Internal Dependencies

- **py_interaction**: Device control abstraction
- **browser-use**: AI agent framework
- **FastAPI**: Web framework
- **React**: Monitoring UI

## Future Enhancements

### Planned Features

1. **Multi-Site Support**: Additional job site optimizations
2. **Advanced AI**: Improved form field detection
3. **Batch Processing**: Multiple applications in parallel
4. **Analytics**: Detailed performance metrics
5. **Customization**: User-defined form field mappings

### Architecture Improvements

1. **Microservices**: Split into smaller, focused services
2. **Message Queues**: Asynchronous job processing
3. **Database Integration**: Persistent storage for analytics
4. **Cloud Deployment**: Container-based deployment
5. **API Gateway**: Centralized API management

