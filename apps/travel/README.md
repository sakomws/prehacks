# 🧳 Travel Applications

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

This directory contains travel-related applications and projects focused on AI-powered travel planning and booking.

## 🔗 Quick Links

- [Main Apps Directory](../README.md)
- [Beacon Travel Agent](beacon/)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## Available Applications

### 🧳 Beacon Travel Agent

**Location:** `beacon/`

A comprehensive AI-powered travel companion system with 7 specialized agents that provide real-time search and booking capabilities for all travel needs.

#### Overview
The Beacon Travel Agent is a microservices-based application that provides intelligent travel recommendations across multiple domains. It features a modern Next.js frontend and individual FastAPI microservices for each travel service.

#### Key Features
- **7 AI Agents** - Specialized microservices for different travel domains
- **Real-time Data** - Live web search with You.com API
- **AI Scoring** - Intelligent recommendations based on multiple factors
- **Direct Booking** - Integration with booking platforms
- **Health Monitoring** - Real-time agent status and performance metrics
- **Modern UI** - Next.js 15 with TypeScript and Tailwind CSS

#### Architecture
```
beacon/
├── agents/              # 7 microservices
│   ├── flight/         # Flight search (Port 8000)
│   ├── food/           # Restaurant discovery (Port 8001)
│   ├── leisure/        # Activity search (Port 8002)
│   ├── shopping/       # Product search (Port 8003)
│   ├── stay/           # Hotel search (Port 8004)
│   ├── work/           # Coworking spaces (Port 8005)
│   └── commute/        # Transportation (Port 8006)
├── ui/                 # Next.js frontend (Port 3000)
├── docs/               # Comprehensive documentation
├── mock_responses/     # Sample API responses
└── start_all.sh        # Startup script
```

#### Quick Start
```bash
cd beacon
./start_all.sh
# Open http://localhost:3000
```

#### Documentation
- [Complete README](beacon/README.md)
- [API Documentation](beacon/docs/api-documentation.md)
- [Architecture Guide](beacon/docs/architecture.md)
- [Deployment Guide](beacon/docs/deployment-guide.md)

## Adding New Travel Applications

To add a new travel-related application:

1. **Create a new directory** in this `travel/` folder
2. **Follow the naming convention:** Use kebab-case (e.g., `my-travel-app`)
3. **Include essential files:**
   - `README.md` - Comprehensive documentation
   - `package.json` or `requirements.txt` - Dependencies
   - `.env.example` - Environment variables template
   - `LICENSE` - License file
4. **Update this README** to include your new application
5. **Follow the project structure** established by existing apps

### Recommended Structure
```
travel/
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

### Travel-Specific Considerations
- **Real-time Data**: Consider using live APIs for current information
- **Booking Integration**: Include direct links to booking platforms
- **Location Services**: Implement proper location handling
- **Multi-language Support**: Consider international users
- **Mobile Responsiveness**: Ensure mobile-friendly interfaces

### Documentation
- Document API integrations and data sources
- Include setup instructions for external services
- Provide examples of search queries and responses
- Document any rate limits or usage restrictions

### Performance
- Optimize for real-time data fetching
- Implement proper caching strategies
- Consider API rate limits
- Monitor response times and error rates

## Contributing

1. Fork the repository
2. Create a new travel app in this directory
3. Follow the guidelines above
4. Update this README
5. Submit a pull request

## Support

For questions about specific travel applications, check their individual README files. For general questions about the travel directory structure, please open an issue.

## 🔗 Related Projects

- [Main Apps Directory](../README.md)
- [Finance Apps](../finance/)
- [Hackathon Apps](../hackathon/)

---

**Built for seamless travel planning and booking**
