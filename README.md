# Prehacks

Prehacks for hackathons - a collection of tools, templates, and resources to help you get started quickly at hackathons.

## Project Structure

This project follows a well-organized directory structure:

```
prehacks/
├── apps/                   # Hackathon applications and projects
├── tests/                  # Unit, integration, and e2e tests
├── docs/                   # Documentation, tutorials, architecture notes
├── demos/                  # Example usage and sample applications
├── tools/                  # Helper scripts for CI/CD, builds, code generation
├── deploy/                 # Configuration files, manifests (Dockerfiles, Helm charts, Terraform)
├── .github/workflows/      # GitHub Actions CI/CD workflows
├── README.md               # Project overview and getting started guide
├── CONTRIBUTING.md         # Guidelines for external contributors
├── CODE_OF_CONDUCT.md      # Community rules and behavior expectations
├── CHANGELOG.md            # Release history and changes
├── SECURITY.md             # Security policy and vulnerability reporting
├── LICENSE                 # Open-source license
├── .gitignore              # Git ignore patterns
└── .editorconfig           # Editor configuration
```

## Available Applications

### 🧳 Beacon Travel Agent
A comprehensive AI-powered travel companion system with 7 specialized agents that provide real-time search and booking capabilities for all travel needs.

**Location:** `apps/travel/beacon/`

**Features:**
- ✈️ **Flight Agent** - Real-time flight search with multi-airline comparison
- 🍽️ **Food Agent** - Restaurant discovery with cuisine filtering and reservations
- 🏨 **Stay Agent** - Hotel search with amenity matching and booking
- 💼 **Work Agent** - Coworking space discovery with location-based search
- 🎯 **Leisure Agent** - Activity and entertainment search with booking
- 🛍️ **Shopping Agent** - Product search with brand matching and purchase links
- 🚌 **Commute Agent** - Multi-mode transportation options

**Tech Stack:** Next.js 15, FastAPI, TypeScript, Tailwind CSS, BrightData API, AI21 API

**Quick Start:**
```bash
cd apps/travel/beacon
./start_all.sh
# Open http://localhost:3000
```

## Quick Start

1. Clone the repository
2. Navigate to the relevant directory based on your needs
3. Follow the specific README in each subdirectory

## Directory Overview

- **`/apps`** - Hackathon applications and projects
  - **`/travel`** - Travel-related applications
    - **`beacon`** - AI-powered travel companion with 7 specialized agents for flights, hotels, dining, activities, shopping, coworking, and transportation
- **`/tests`** - All testing files (unit, integration, e2e)
- **`/docs`** - Documentation, tutorials, and architecture notes
- **`/demos`** - Example applications and usage demonstrations
- **`/tools`** - Helper scripts for development, CI/CD, and automation
- **`/deploy`** - Deployment configurations and infrastructure as code

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Security

Please see our [Security Policy](SECURITY.md) for information about reporting security vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
