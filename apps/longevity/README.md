# 🧬 Longevity & Health Applications

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Collection of health and longevity applications focused on helping users make informed health decisions through AI-powered analytics and tracking.

## 🚀 Applications

### 🏆 EveryBallWins - AI-Powered Health Analytics

**Location:** `everyballwins/`  
**Website:** [everyballwins.com](https://everyballwins.com)

A comprehensive health analytics platform that combines food analysis, barcode scanning, and biological age assessment to help users make informed health decisions.

#### 🌟 Key Features

**🍎 Food Analytics**
- AI-powered food image analysis using OpenAI Vision API
- Real-time camera capture for instant nutritional analysis
- Barcode scanning for product information
- Detailed sugar content tracking
- Restaurant menu integration

**🧬 BioAge Analysis**
- Real-time biological age assessment
- WebSocket integration for live data streaming
- Comprehensive health metrics and scoring
- Personalized health recommendations

**📊 Health Tracking**
- Visual sugar intake calendar
- Progress tracking over time
- Gamified health challenges
- Achievement system

**📱 Modern Experience**
- Responsive design for all devices
- Dark mode support
- Intuitive user interface
- Real-time updates

#### 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **AI Integration:** OpenAI Vision API, GPT-4
- **Barcode Scanning:** ZXing library
- **Backend:** Next.js API routes, Python WebSocket server
- **Database:** Supabase
- **Deployment:** Vercel

#### 🚀 Quick Start

```bash
cd everyballwins
yarn install

# Set up environment variables
cp .env_example .env.local
# Add your OPENAI_API_KEY to .env.local

# Start development server
yarn dev

# Start BioAge WebSocket server (separate terminal)
cd bioage
python3 websocket-server.py

# Or use convenience script
./start-bioage.sh
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 📁 Project Structure

```
everyballwins/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── analyze-food/     # Food analysis
│   │   ├── analyze-barcode/  # Barcode scanning
│   │   └── product-lookup/   # Product info
│   ├── bioage/               # BioAge analysis
│   ├── dashboard/            # Main dashboard
│   └── food-analytics/       # Food interface
├── bioage/                   # WebSocket server
│   ├── backend/              # Python backend
│   └── websocket-server.py   # WebSocket server
├── components/               # UI components
├── lib/                      # Utilities
├── doc/                      # Documentation
└── public/                   # Static assets
```

#### 🔧 Configuration

**Required Environment Variables:**
```bash
# OpenAI API (Required)
OPENAI_API_KEY=sk-your-api-key-here

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 📱 Usage

1. **Food Analysis:** Capture or upload food images for AI-powered nutritional analysis
2. **Barcode Scanning:** Scan product barcodes for instant nutritional information
3. **BioAge Assessment:** Get real-time biological age analysis and health metrics
4. **Track Progress:** Monitor sugar intake and health improvements over time
5. **Complete Challenges:** Participate in gamified health challenges

#### 🚀 Deployment

**Vercel (Recommended):**
1. Connect repository to Vercel
2. Add environment variables
3. Deploy automatically on push

**WebSocket Server:**
- Deploy Python WebSocket server separately
- Ensure port 8081 is accessible
- Configure connection in frontend

#### 📚 Documentation

- [Complete README](everyballwins/README.md)
- [API Documentation](everyballwins/doc/)
- [Setup Guide](everyballwins/README.md#getting-started)

## 🎯 Future Applications

This directory is designed to host additional longevity and health-focused applications:

- Fitness tracking and workout planning
- Nutrition planning and meal prep
- Sleep analysis and optimization
- Mental health and wellness tracking
- Biometric data integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [EveryBallWins documentation](everyballwins/README.md)
- Open an issue on GitHub
- Review troubleshooting guides

## 🔗 Links

- [Main Apps Directory](../README.md)
- [EveryBallWins Platform](everyballwins/)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)