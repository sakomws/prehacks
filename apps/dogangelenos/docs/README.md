# 🐕 Dog Angelenos - Professional Dog Training in Los Angeles

A modern, SEO-optimized dog training website designed to compete with Petco and rank in the top 3 for Los Angeles dog training searches.

## 🎯 Project Goal

Create LA's premier dog training website with:
- Professional design similar to Petco's training page
- Online booking system with backend API
- Gmail authentication
- LA-specific customization
- SEO optimization for top 3 Google ranking

## 📁 Project Structure

```
apps/dogangelenos/
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js app directory
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Python FastAPI backend
│   ├── main.py          # API server
│   ├── database.py      # Database models
│   ├── auth.py          # Authentication
│   └── requirements.txt # Python dependencies
├── FEATURES.md          # Complete feature list
├── SEO_GUIDE.md        # SEO strategy & roadmap
├── SETUP.md            # Setup instructions
└── README.md           # This file
```

## 🚀 Quick Start

### Option 1: Run Both Servers

```bash
cd apps/dogangelenos
./start-dev.sh
```

### Option 2: Run Separately

**Frontend:**
```bash
cd apps/dogangelenos/frontend
npm install
npm run dev
```
Visit: http://localhost:3004

**Backend:**
```bash
cd apps/dogangelenos/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
API: http://localhost:8000
Docs: http://localhost:8000/docs

## ✨ Features

### Core Functionality
- 🏆 **Professional Training Programs**: Puppy, Basic Obedience, Advanced Training
- 📅 **Online Booking System**: Complete form with backend API
- 🔐 **Gmail Sign-In**: Google OAuth integration
- 📍 **LA Locations**: West Hollywood, Santa Monica, Downtown LA, Silver Lake, Venice Beach
- ⭐ **Social Proof**: Testimonials and 5-star ratings
- 💳 **Clear Pricing**: Transparent pricing for all programs
- 🐍 **Python Backend**: FastAPI REST API
- 💾 **Database**: SQLite/PostgreSQL support
- 💬 **Real-time Chat**: WebSocket-based chat between trainers & customers

### SEO Optimization
- 🔍 **Structured Data**: Schema.org LocalBusiness markup
- 📊 **Meta Tags**: Optimized titles and descriptions
- 🗺️ **Sitemap**: XML sitemap for search engines
- 🤖 **Robots.txt**: Proper crawler directives
- 📱 **Mobile-First**: Responsive design
- ⚡ **Fast Loading**: Next.js optimization

### Design
- 🌅 **LA-Themed**: Sunset gradient colors (purple → pink → orange)
- 🎨 **Modern UI**: Clean, professional design
- ✨ **Smooth Animations**: Framer Motion effects
- 📱 **Responsive**: Works on all devices

## 🎨 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **SEO**: Built-in Next.js features + Schema.org

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: SQLAlchemy (SQLite/PostgreSQL)
- **Auth**: JWT + Google OAuth
- **Email**: SendGrid integration ready

## 📈 SEO Strategy

### Target Keywords
- dog training los angeles
- LA dog trainers
- puppy training LA
- dog obedience classes los angeles

### Ranking Timeline
- **Month 1-3**: Technical SEO + Google Business Profile
- **Month 4-6**: Content creation + Local citations
- **Month 7-12**: Authority building + Backlinks
- **Goal**: Top 3 ranking within 6-12 months

See `SEO_GUIDE.md` for detailed strategy.

## 🗄️ Database

PostgreSQL database is included and ready to use!

**Start with Docker:**
```bash
cd apps/dogangelenos/backend
docker-compose up -d postgres
python init_db.py
```

**Or use local PostgreSQL:**
See `backend/POSTGRES_SETUP.md` for installation instructions.

The database includes:
- Bookings table with all booking information
- Users table for authentication
- Sample data for testing
- Automatic migrations with Alembic

## 🔧 Next Steps for Production

1. ✅ **Database**: PostgreSQL integrated
2. **Google OAuth**: Complete OAuth verification
3. **Email**: Integrate SendGrid
4. **Payments**: Add Stripe integration
5. **Analytics**: Add Google Analytics 4
6. **Domain**: Deploy to custom domain
7. **Google Business**: Create and verify profile

See `SETUP.md` and `backend/README.md` for detailed instructions.

## 📊 Current Status

- ✅ Full website design implemented
- ✅ All sections complete
- ✅ SEO fully optimized
- ✅ Mobile responsive
- ✅ Build successful
- ✅ No errors
- 🔧 Ready for OAuth integration
- 🔧 Ready for backend integration

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS/Android)

## 📄 Documentation

- **FEATURES.md**: Complete feature list
- **SEO_GUIDE.md**: SEO strategy and optimization tips
- **SETUP.md**: Setup and deployment instructions
- **CHAT_FEATURES.md**: Real-time chat system documentation
- **ADMIN_GUIDE.md**: Admin dashboard documentation
- **frontend/README.md**: Frontend-specific documentation
- **backend/README.md**: Backend API documentation
- **backend/POSTGRES_SETUP.md**: PostgreSQL setup guide

## 🎯 Competitive Advantage

### vs Petco
- ✅ LA-specific focus (not nationwide)
- ✅ Local SEO optimization
- ✅ Personalized service emphasis
- ✅ Modern, fast website
- ✅ Better mobile experience

### vs Local Competitors
- ✅ Professional design
- ✅ Online booking system
- ✅ Strong SEO foundation
- ✅ Social proof
- ✅ Multiple locations

## 🤝 Contributing

This is a production website. For changes:
1. Test locally first
2. Check SEO impact
3. Verify mobile responsiveness
4. Run build before deploying

## 📞 Support

For questions about:
- **Setup**: See SETUP.md
- **Features**: See FEATURES.md
- **SEO**: See SEO_GUIDE.md

---

**Built with ❤️ for LA dog owners** 🐕🌴🌅
