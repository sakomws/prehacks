# MentorMap Documentation

Complete documentation for deploying and managing MentorMap.

## 📚 Documentation Files

### [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)
Comprehensive guide for deploying MentorMap on Amazon EC2.

**Contents:**
- EC2 instance setup
- Security group configuration
- Initial deployment steps
- Nginx configuration
- SSL setup with Let's Encrypt
- Database management
- Monitoring and troubleshooting
- Performance optimization
- Cost optimization tips

**Target Audience:** DevOps, System Administrators

---

### [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
Step-by-step guide for deploying to production with mentormap.ai domain.

**Contents:**
- DNS configuration
- Environment variable setup
- Frontend API configuration
- Nginx setup for production
- SSL certificate installation
- LinkedIn OAuth configuration
- Stripe webhook setup
- Deployment workflow
- Monitoring and maintenance
- Security checklist

**Target Audience:** Developers, DevOps

---

## 🚀 Quick Links

### Getting Started
1. [Initial EC2 Setup](./EC2_DEPLOYMENT_GUIDE.md#step-1-launch-ec2-instance)
2. [Configure DNS](./PRODUCTION_SETUP.md#step-1-configure-dns-records)
3. [Deploy Application](./EC2_DEPLOYMENT_GUIDE.md#step-5-run-deployment-script)
4. [Setup SSL](./PRODUCTION_SETUP.md#step-6-obtain-ssl-certificates)

### Common Tasks
- [Update Application](./PRODUCTION_SETUP.md#production-deployment-workflow)
- [View Logs](./EC2_DEPLOYMENT_GUIDE.md#view-system-resources)
- [Backup Database](./EC2_DEPLOYMENT_GUIDE.md#database-backup)
- [Troubleshooting](./PRODUCTION_SETUP.md#troubleshooting)

### Configuration
- [Environment Variables](./PRODUCTION_SETUP.md#step-3-configure-environment-variables)
- [Nginx Setup](./EC2_DEPLOYMENT_GUIDE.md#step-7-configure-nginx-production)
- [SSL Certificates](./PRODUCTION_SETUP.md#step-6-obtain-ssl-certificates)

## 📋 Prerequisites

Before deploying MentorMap, ensure you have:

- ✅ AWS Account with EC2 access
- ✅ Domain name (mentormap.ai)
- ✅ LinkedIn Developer App (OAuth credentials)
- ✅ Stripe Account (API keys)
- ✅ Email account for SMTP (Gmail recommended)
- ✅ SSH key pair for EC2 access

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   mentormap.ai                      │
│                   (Frontend - Next.js)              │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────┐
│                  Nginx (Reverse Proxy)              │
│              SSL Termination & Load Balancing       │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
              │ Port 3000            │ Port 8000
              │                       │
┌─────────────▼──────────┐  ┌────────▼──────────────┐
│   Next.js Frontend     │  │  FastAPI Backend      │
│   (PM2 Process)        │  │  (PM2 Process)        │
└────────────────────────┘  └───────┬───────────────┘
                                    │
                                    │
                            ┌───────▼────────┐
                            │  SQLite DB     │
                            │  mentormap.db  │
                            └────────────────┘
```

## 🔐 Security Best Practices

1. **SSL/TLS:** Always use HTTPS in production
2. **Environment Variables:** Never commit secrets to git
3. **Firewall:** Only open necessary ports (22, 80, 443)
4. **SSH:** Use key-based authentication only
5. **Updates:** Keep system and dependencies updated
6. **Backups:** Regular database backups
7. **Monitoring:** Set up logging and alerts

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Deployment:** PM2 + Nginx

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (PostgreSQL for production scale)
- **Authentication:** JWT + OAuth2 (LinkedIn)
- **Payment:** Stripe
- **Email:** SMTP (Gmail)

### Infrastructure
- **Server:** Amazon EC2 (Amazon Linux 2023)
- **Web Server:** Nginx
- **Process Manager:** PM2
- **SSL:** Let's Encrypt (Certbot)
- **Domain:** mentormap.ai

## 📊 Monitoring

### Application Logs
```bash
pm2 logs                      # All logs
pm2 logs mentormap-backend    # Backend logs
pm2 logs mentormap-frontend   # Frontend logs
```

### System Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
```bash
pm2 monit                     # Real-time monitoring
htop                          # System resources
df -h                         # Disk usage
```

## 🆘 Support & Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Solution: Run `scripts/fix-port-conflict.sh`

2. **SSL Certificate Errors**
   - Check DNS: `dig mentormap.ai`
   - Verify certificates: `sudo certbot certificates`
   - Renew: `sudo certbot renew --force-renewal`

3. **API Calls Failing**
   - Check CORS in Nginx config
   - Verify backend is running: `curl http://localhost:8000/health`
   - Check frontend env: `cat frontend/.env.production`

4. **LinkedIn OAuth Not Working**
   - Verify redirect URI in LinkedIn app settings
   - Check backend .env: `LINKEDIN_REDIRECT_URI`
   - Test: Visit `https://api.mentormap.ai/api/auth/linkedin`

### Getting Help

1. Check the troubleshooting sections in the guides
2. Review application logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify DNS: `dig mentormap.ai`
5. Test API: `curl https://api.mentormap.ai/health`

## 📝 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

## 🔄 Update History

- **v1.0** - Initial deployment documentation
- Added production setup guide
- Added SSL configuration
- Added troubleshooting guides

---

For script documentation, see [../scripts/README.md](../scripts/README.md)
