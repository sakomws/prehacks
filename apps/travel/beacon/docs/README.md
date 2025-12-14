# Beacon Travel Agent Documentation

Welcome to the Beacon Travel Agent documentation. This comprehensive guide covers all aspects of the system, from architecture to deployment.

## 📚 Documentation Index

### Core Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Architecture Overview](architecture.md) | System design and technical architecture | Developers, Architects |
| [Solution Overview](solution-overview.md) | Business value and problem-solving approach | Product Managers, Stakeholders |
| [API Documentation](api-documentation.md) | Complete API reference and examples | Developers, Integrators |
| [Deployment Guide](deployment-guide.md) | Setup, deployment, and operations | DevOps, System Administrators |

### Agent-Specific Documentation

| Agent | Documentation | Purpose |
|-------|---------------|---------|
| [Flight Agent](agents/flight-agent.md) | Flight search and booking | Flight search implementation |
| [Food Agent](agents/food-agent.md) | Restaurant discovery and recommendations | Restaurant search implementation |
| [Stay Agent](agents/stay-agent.md) | Hotel and accommodation search | Hotel search implementation |
| [Work Agent](agents/work-agent.md) | Coworking space discovery | Coworking search implementation |
| [Leisure Agent](agents/leisure-agent.md) | Activity and entertainment search | Activity search implementation |
| [Shopping Agent](agents/shopping-agent.md) | Product and shopping search | Shopping search implementation |
| [Commute Agent](agents/commute-agent.md) | Transportation and commute options | Transportation search implementation |

### Frontend Documentation

| Document | Description | Purpose |
|----------|-------------|---------|
| [Frontend Documentation](ui/frontend-documentation.md) | UI components and user interface | Frontend developers |
| [API Proxy Documentation](api-proxy-documentation.md) | API routing and proxy implementation | Backend developers |

## 🚀 Quick Start

### Prerequisites

- Python 3.11.6+
- Node.js 18.0+
- You.com API Key
- AI21 API Key

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/beacon-travel-agent.git
cd beacon-travel-agent

# Install dependencies
cd agents/flight && pip install -r requirements.txt
cd ../food && pip install -r requirements.txt
cd ../stay && pip install -r requirements.txt
cd ../work && pip install -r requirements.txt
cd ../leisure && pip install -r requirements.txt
cd ../shopping && pip install -r requirements.txt
cd ../commute && pip install -r requirements.txt
cd ../../ui && npm install

# Configure environment
cp agents/flight/env_example.txt agents/flight/.env
# Edit .env files with your API keys

# Start all services
./start_all.sh
```

### Verify Installation

```bash
# Check all agents are healthy
curl http://localhost:8000/health  # Flight Agent
curl http://localhost:8001/health  # Food Agent
curl http://localhost:8002/health  # Leisure Agent
curl http://localhost:8003/health  # Shopping Agent
curl http://localhost:8004/health  # Stay Agent
curl http://localhost:8005/health  # Work Agent
curl http://localhost:8006/health  # Commute Agent

# Check UI is running
curl http://localhost:3000
```

## 🏗️ System Architecture

The Beacon Travel Agent follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI    │    │   API Proxy     │    │  Agent Services │
│                 │◄──►│                 │◄──►│                 │
│  - React Components │    │  - Request Routing │    │  - Flight Agent  │
│  - Tailwind CSS    │    │  - Response Format │    │  - Food Agent     │
│  - TypeScript      │    │  - Error Handling  │    │  - Stay Agent     │
└─────────────────┘    └─────────────────┘    │  - Work Agent     │
│  - Leisure Agent  │
│  - Shopping Agent │
│  - Commute Agent  │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ External APIs   │
                                              │                 │
                                              │ - BrightData    │
                                              │ - AI21          │
                                              │ - Google Search │
                                              └─────────────────┘
```

## 🔧 Key Features

### AI-Powered Search
- **Real-time Data**: Live information from multiple sources
- **Intelligent Scoring**: AI-driven recommendations
- **Contextual Results**: Location and preference-aware results

### Comprehensive Coverage
- **Flights**: Multi-airline search with price comparison
- **Food**: Restaurant discovery with cuisine filtering
- **Stay**: Hotel search with amenity matching
- **Work**: Coworking space discovery
- **Leisure**: Activity and entertainment search
- **Shopping**: Product and local brand discovery
- **Commute**: Transportation and commute options

### User Experience
- **Unified Interface**: All services in one platform
- **Real-time Updates**: Live agent status monitoring
- **Booking Integration**: Direct links to booking platforms
- **Responsive Design**: Works on all devices

## 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Response Time | < 2s | ~1.5s |
| Uptime | 99.9% | 99.8% |
| Data Freshness | < 5min | ~2min |
| Concurrent Users | 1000+ | 100+ |

## 🔒 Security

- **API Key Management**: Secure environment variable handling
- **Input Validation**: Comprehensive request validation
- **Error Handling**: No sensitive data exposure
- **CORS Configuration**: Secure cross-origin requests

## 📈 Scalability

- **Microservices**: Independent scaling of each agent
- **Stateless Design**: No shared state between requests
- **Caching**: Response caching for improved performance
- **Load Balancing**: Ready for horizontal scaling

## 🛠️ Development

### Code Structure

```
beacon-travel-agent/
├── agents/                 # Backend microservices
│   ├── flight/            # Flight search agent
│   ├── food/              # Restaurant search agent
│   ├── stay/              # Hotel search agent
│   ├── work/              # Coworking search agent
│   ├── leisure/           # Activity search agent
│   ├── shopping/          # Product search agent
│   └── commute/           # Transportation search agent
├── ui/                    # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   └── components/    # React components
│   └── public/            # Static assets
├── docs/                  # Documentation
└── start_all.sh          # Service startup script
```

### Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Pydantic (Data validation)
- Requests (HTTP client)
- BrightData API (Web scraping)
- AI21 API (AI processing)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Fetch API (HTTP client)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [API Documentation](api-documentation.md)
2. Review the [Deployment Guide](deployment-guide.md)
3. Open an issue on GitHub
4. Contact the development team

## 🔄 Changelog

### Version 1.2.0 (Current)
- ✅ All 7 systems operational and healthy
- ✅ Real data integration (no mock data)
- ✅ Booking links for all services
- ✅ UI fixes (Food agent now displays results)
- ✅ Dynamic location support (Work agent)
- ✅ New Commute Agent for transportation options
- ✅ Comprehensive documentation updates
- ✅ All agents using BrightData API

### Version 1.1.0
- All six agent services
- Complete API documentation
- Deployment guides
- Frontend interface

### Version 1.0.0
- Initial release
- Basic agent services
- Core functionality

---

**Last Updated**: January 20, 2025  
**Version**: 1.2.0  
**Maintainer**: Beacon Travel Agent Team
