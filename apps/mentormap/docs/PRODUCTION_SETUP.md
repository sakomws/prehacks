# MentorMap Production Setup for mentormap.ai

Complete guide to deploy MentorMap on mentormap.ai domain.

## Prerequisites

✅ Domain: mentormap.ai (registered and accessible)
✅ EC2 Instance: Running Amazon Linux 2023
✅ Elastic IP: Allocated and associated with EC2
✅ Security Groups: Configured (ports 22, 80, 443)

## Step 1: Configure DNS Records

Point your domain to your EC2 Elastic IP:

```
Type    Name              Value                TTL
A       mentormap.ai      YOUR_EC2_ELASTIC_IP  300
A       www.mentormap.ai  YOUR_EC2_ELASTIC_IP  300
A       api.mentormap.ai  YOUR_EC2_ELASTIC_IP  300
```

**Verify DNS propagation:**
```bash
dig mentormap.ai
dig api.mentormap.ai
```

## Step 2: Initial Deployment

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

Clone repository and run initial deployment:

```bash
cd /home/ec2-user
git clone https://github.com/your-username/prehacks.git
cd prehacks/apps/mentormap

# Make scripts executable
chmod +x deploy-ec2.sh deploy-production.sh

# Run initial deployment
./deploy-ec2.sh
```

## Step 3: Configure Environment Variables

### Backend Configuration

```bash
cd backend
nano .env
```

Update these values:

```env
# LinkedIn OAuth - IMPORTANT: Update redirect URI
LINKEDIN_REDIRECT_URI=https://api.mentormap.ai/api/auth/linkedin/callback

# All other values should already be set
```

### Frontend Configuration

The `.env.production` file is already configured with:
```env
NEXT_PUBLIC_API_URL=https://api.mentormap.ai
```

## Step 4: Update Frontend API Calls

Update all API calls in the frontend to use the environment variable:

```bash
cd frontend
```

Search and replace hardcoded localhost URLs:
```bash
# Find all localhost references
grep -r "localhost:8000" src/

# They should use process.env.NEXT_PUBLIC_API_URL or be updated to:
# https://api.mentormap.ai
```

**Key files to check:**
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/mentors/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/sessions/success/page.tsx`

## Step 5: Install and Configure Nginx

```bash
cd /home/ec2-user/prehacks/apps/mentormap

# Copy Nginx configuration
sudo cp nginx-mentormap.conf /etc/nginx/conf.d/mentormap.conf

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 6: Obtain SSL Certificates

Install Certbot:

```bash
sudo yum install -y certbot python3-certbot-nginx
```

Create directory for Let's Encrypt:

```bash
sudo mkdir -p /var/www/certbot
```

Obtain certificates:

```bash
sudo certbot --nginx -d mentormap.ai -d www.mentormap.ai -d api.mentormap.ai
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

**Verify auto-renewal:**
```bash
sudo certbot renew --dry-run
```

## Step 7: Update LinkedIn OAuth Settings

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to "Auth" tab
4. Update "Redirect URLs":
   - Add: `https://api.mentormap.ai/api/auth/linkedin/callback`
   - Remove: `http://localhost:8000/api/auth/linkedin/callback`

## Step 8: Rebuild and Restart Services

```bash
cd /home/ec2-user/prehacks/apps/mentormap

# Rebuild frontend with production settings
cd frontend
NODE_ENV=production npm run build

# Restart services
pm2 restart all

# Check status
pm2 status
pm2 logs
```

## Step 9: Verify Deployment

Test all endpoints:

```bash
# Frontend
curl https://mentormap.ai

# Backend API
curl https://api.mentormap.ai/health

# API Docs
curl https://api.mentormap.ai/docs
```

Visit in browser:
- https://mentormap.ai
- https://api.mentormap.ai/docs

## Step 10: Update Stripe Webhook (if using Stripe)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Update webhook endpoint to: `https://api.mentormap.ai/api/webhooks/stripe`
3. Update `STRIPE_WEBHOOK_SECRET` in backend/.env

## Production Deployment Workflow

For future updates, use the production deployment script:

```bash
cd /home/ec2-user/prehacks/apps/mentormap
./deploy-production.sh
```

This script will:
- Pull latest code
- Update dependencies
- Rebuild frontend
- Restart services
- Maintain SSL configuration

## Monitoring and Maintenance

### View Logs

```bash
# All services
pm2 logs

# Specific service
pm2 logs mentormap-backend
pm2 logs mentormap-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status

```bash
pm2 status
sudo systemctl status nginx
```

### SSL Certificate Renewal

Certificates auto-renew. To manually renew:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Database Backup

```bash
cd /home/ec2-user/prehacks/apps/mentormap/backend
cp mentormap.db mentormap.db.backup-$(date +%Y%m%d-%H%M%S)
```

### Restart Services

```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart mentormap-backend
pm2 restart mentormap-frontend

# Restart Nginx
sudo systemctl restart nginx
```

## Troubleshooting

### Issue: Site not loading

1. Check DNS propagation: `dig mentormap.ai`
2. Check Nginx: `sudo systemctl status nginx`
3. Check services: `pm2 status`
4. Check logs: `pm2 logs`

### Issue: SSL certificate errors

1. Verify certificates: `sudo certbot certificates`
2. Check Nginx config: `sudo nginx -t`
3. Renew if needed: `sudo certbot renew --force-renewal`

### Issue: API calls failing

1. Check CORS settings in Nginx config
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check frontend env: `cat frontend/.env.production`
4. Check browser console for errors

### Issue: LinkedIn OAuth not working

1. Verify redirect URI in LinkedIn app settings
2. Check backend .env: `LINKEDIN_REDIRECT_URI=https://api.mentormap.ai/api/auth/linkedin/callback`
3. Test OAuth flow: Visit `https://api.mentormap.ai/api/auth/linkedin`

## Security Checklist

- ✅ SSL certificates installed and auto-renewing
- ✅ Firewall configured (only ports 22, 80, 443 open)
- ✅ SSH key-based authentication only
- ✅ Regular security updates: `sudo yum update -y`
- ✅ Database backups scheduled
- ✅ Environment variables secured (not in git)
- ✅ CORS properly configured
- ✅ Security headers in Nginx config

## Performance Optimization

### Enable Nginx Caching

Already configured in nginx-mentormap.conf:
- Static files cached for 1 year
- Next.js static files cached for 60 minutes
- Gzip compression enabled

### Monitor Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

### Scale if Needed

If traffic increases:
1. Upgrade EC2 instance type
2. Enable PM2 cluster mode
3. Consider RDS for database
4. Add CloudFront CDN
5. Implement Redis caching

## Support

For issues:
1. Check logs: `pm2 logs`
2. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `dig mentormap.ai`
4. Test API: `curl https://api.mentormap.ai/health`

## Quick Reference

```bash
# Deploy updates
./deploy-production.sh

# View logs
pm2 logs

# Restart services
pm2 restart all

# Check status
pm2 status

# Nginx reload
sudo systemctl reload nginx

# SSL renewal
sudo certbot renew

# Database backup
cp backend/mentormap.db backend/mentormap.db.backup-$(date +%Y%m%d)
```

---

🎉 **Your MentorMap application is now live at https://mentormap.ai!**
