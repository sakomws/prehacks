# Apps Directory

This directory contains hackathon applications and projects built for rapid prototyping and demonstration.

## Available Applications

### 🧳 Beacon Travel Agent

**Location:** `travel/beacon/`

A comprehensive AI-powered travel companion system with 7 specialized agents that provide real-time search and booking capabilities for all travel needs.

#### Features
- **7 AI Agents** - Each specialized for different travel domains
- **Real-time Data** - Live web scraping with BrightData API
- **AI Scoring** - Intelligent recommendations based on multiple factors
- **Direct Booking** - Integration with booking platforms
- **Modern UI** - Next.js 15 with TypeScript and Tailwind CSS
- **Health Monitoring** - Real-time agent status and performance metrics

#### Agents
| Agent | Port | Description |
|-------|------|-------------|
| ✈️ Flight | 8000 | Real-time flight search with multi-airline comparison |
| 🍽️ Food | 8001 | Restaurant discovery with cuisine filtering and reservations |
| 🎯 Leisure | 8002 | Activity and entertainment search with booking |
| 🛍️ Shopping | 8003 | Product search with brand matching and purchase links |
| 🏨 Stay | 8004 | Hotel search with amenity matching and booking |
| 💼 Work | 8005 | Coworking space discovery with location-based search |
| 🚌 Commute | 8006 | Transportation and commute options |

#### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11
- **Data Sources:** BrightData API, AI21 API
- **Architecture:** Microservices with API Gateway

#### Quick Start
```bash
cd travel/beacon
./start_all.sh
# Open http://localhost:3000
```

#### Documentation
- [Complete README](travel/beacon/README.md)
- [API Documentation](travel/beacon/docs/api-documentation.md)
- [Architecture Guide](travel/beacon/docs/architecture.md)
- [Deployment Guide](travel/beacon/docs/deployment-guide.md)

## Adding New Applications

To add a new hackathon application:

1. **Create a new directory** in this `apps/` folder
2. **Follow the naming convention:** Use kebab-case (e.g., `my-awesome-app`)
3. **Include essential files:**
   - `README.md` - Comprehensive documentation
   - `package.json` or `requirements.txt` - Dependencies
   - `.env.example` - Environment variables template
   - `LICENSE` - License file
4. **Update this README** to include your new application
5. **Follow the project structure** established by existing apps

### Recommended Structure
```
apps/
├── my-new-app/
│   ├── README.md              # Comprehensive documentation
│   ├── package.json           # or requirements.txt
│   ├── .env.example          # Environment variables
│   ├── LICENSE               # License file
│   ├── src/                  # Source code
│   ├── docs/                 # Documentation
│   ├── tests/                # Test files
│   └── deploy/               # Deployment configs
└── README.md                 # This file
```

## Guidelines

### Documentation
- Each app should have comprehensive documentation
- Include setup instructions, API documentation, and examples
- Document the tech stack and architecture decisions
- Provide troubleshooting guides

### Code Quality
- Follow established coding standards
- Include proper error handling
- Write tests where appropriate
- Use meaningful variable and function names

### Deployment
- Provide clear deployment instructions
- Include environment variable documentation
- Consider containerization (Docker)
- Document any external dependencies

### Performance
- Optimize for hackathon demos
- Include performance metrics where relevant
- Document any known limitations
- Provide scaling recommendations

## Contributing

1. Fork the repository
2. Create a new app in the `apps/` directory
3. Follow the guidelines above
4. Update this README
5. Submit a pull request

## Support

For questions about specific applications, check their individual README files. For general questions about the apps directory structure, please open an issue.
