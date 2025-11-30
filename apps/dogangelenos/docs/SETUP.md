# Dog Angelenos - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd apps/dogangelenos
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3004

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Features Implemented

### ✅ Core Features
- Professional dog training website design
- LA-themed branding with sunset gradient colors
- Responsive mobile-first design
- Three training programs (Puppy, Basic, Advanced)
- Online booking form with all fields
- Gmail authentication (placeholder - ready for integration)
- Multiple LA locations (West Hollywood, Santa Monica, Downtown, Silver Lake, Venice)

### ✅ SEO Optimization
- Structured data (Schema.org LocalBusiness)
- Optimized meta tags and descriptions
- Sitemap.xml and robots.txt
- Location-specific keywords
- Fast loading with Next.js
- Mobile responsive

### ✅ User Experience
- Smooth animations with Framer Motion
- Clear call-to-action buttons
- Easy navigation
- Testimonials section
- Why Choose Us section
- Professional footer with contact info

## Next Steps for Production

### 1. Google OAuth Integration
Install NextAuth.js:
```bash
npm install next-auth
```

Configure Google OAuth in `.env.local`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your_secret
```

### 2. Booking System Backend
Options:
- Integrate with Calendly API
- Use Stripe for payments
- Build custom booking system with database

### 3. Database Setup
Recommended: Supabase or Firebase
```bash
npm install @supabase/supabase-js
```

### 4. Email Notifications
Use SendGrid or Resend:
```bash
npm install @sendgrid/mail
```

### 5. Analytics
Add Google Analytics:
```bash
npm install @next/third-parties
```

### 6. Image Optimization
Replace placeholder background with actual LA photo:
- Add `/public/dogangelenos-bg.png` (LA sunset/street scene)
- Optimize images to WebP format
- Use proper alt tags

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Custom Domain
1. Purchase domain (e.g., dogangelenos.com)
2. Configure DNS settings
3. Add SSL certificate (automatic with Vercel)

## SEO Checklist

- [ ] Set up Google Business Profile
- [ ] Submit sitemap to Google Search Console
- [ ] Create social media accounts
- [ ] Start collecting reviews
- [ ] Create blog content
- [ ] Build local citations
- [ ] Monitor keyword rankings

See `SEO_GUIDE.md` for detailed SEO strategy.

## Support

For questions or issues, refer to:
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
