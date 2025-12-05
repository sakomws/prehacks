# ✅ AWS EC2 Deployment Checklist

## Pre-Deployment

- [ ] EC2 instance is running
- [ ] PEM key file is accessible at `~/Downloads/sako.pem`
- [ ] Can SSH into EC2: `ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com`

## Deployment Steps

### 1. Install Dependencies on EC2
- [ ] Node.js 18+ installed
- [ ] Python 3 installed
- [ ] Git installed (optional)

### 2. Upload Application
- [ ] Created deployment package
- [ ] Uploaded to EC2 via SCP
- [ ] Extracted on EC2

### 3. Setup Backend
- [ ] Installed Python dependencies
- [ ] Database initialized
- [ ] Backend starts successfully
- [ ] Can access: http://ec2-3-84-133-237.compute-1.amazonaws.com:8000

### 4. Setup Frontend
- [ ] Installed npm dependencies
- [ ] Created .env.local with correct API URL
- [ ] Built for production
- [ ] Frontend starts successfully
- [ ] Can access: http://ec2-3-84-133-237.compute-1.amazonaws.com:3004

### 5. Seed Data
- [ ] Trainers seeded: `curl -X POST http://localhost:8000/api/trainers/seed`
- [ ] Can see trainers on /trainers page

### 6. Configure Security Group
- [ ] Port 22 (SSH) - Your IP only
- [ ] Port 3004 (Frontend) - 0.0.0.0/0
- [ ] Port 8000 (Backend) - 0.0.0.0/0

### 7. Test Application
- [ ] Homepage loads
- [ ] Dark mode toggle works
- [ ] Trainers page shows data
- [ ] Packages page displays correctly
- [ ] Can login to admin panel
- [ ] Admin can manage trainers
- [ ] Events page works
- [ ] Newsletter page works

### 8. Test Demo Accounts
- [ ] Admin login works: admin@dogangelenos.com / admin123
- [ ] Trainer login works: trainer@dogangelenos.com / trainer123
- [ ] Customer login works: customer@dogangelenos.com / customer123

## Post-Deployment

### Verification
- [ ] All pages load without errors
- [ ] API endpoints respond correctly
- [ ] Dark mode works on all pages
- [ ] Responsive design works on mobile
- [ ] No console errors in browser
- [ ] Backend logs show no errors
- [ ] Frontend logs show no errors

### Documentation Updates
- [ ] Updated KIROWEEN_SUBMISSION.md with live URL
- [ ] Updated README.md with deployment info
- [ ] Updated JUDGES_QUICK_START.md with live URL

### Optional Improvements
- [ ] Setup PM2 for process management
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificate
- [ ] Configure custom domain
- [ ] Setup automated backups
- [ ] Configure monitoring/alerts

## Quick Commands

### Check Services
```bash
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com
ps aux | grep -E "uvicorn|npm"
```

### View Logs
```bash
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com
tail -f ~/dogangelenos/backend.log
tail -f ~/dogangelenos/frontend.log
```

### Restart Services
```bash
ssh -i "~/Downloads/sako.pem" ec2-user@ec2-3-84-133-237.compute-1.amazonaws.com
pkill -f "uvicorn main:app"
pkill -f "npm run start"
cd ~/dogangelenos/backend && nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
cd ~/dogangelenos/frontend && nohup npm run start -- -p 3004 > ../frontend.log 2>&1 &
```

## Live URLs

- **Frontend**: http://ec2-3-84-133-237.compute-1.amazonaws.com:3004
- **Backend**: http://ec2-3-84-133-237.compute-1.amazonaws.com:8000
- **API Docs**: http://ec2-3-84-133-237.compute-1.amazonaws.com:8000/docs

## Troubleshooting

### Can't access application
1. Check security group has ports open
2. Check services are running: `ps aux | grep -E "uvicorn|npm"`
3. Check logs for errors
4. Verify EC2 instance is running

### Services not starting
1. Check dependencies installed
2. Check for port conflicts: `sudo lsof -i :8000` and `sudo lsof -i :3004`
3. Check logs for specific errors
4. Try starting manually to see errors

### Frontend can't connect to backend
1. Check .env.local has correct API URL
2. Rebuild frontend: `npm run build`
3. Restart frontend service
4. Check CORS settings in backend

## Success Criteria

✅ Application is accessible from any browser
✅ All features work as expected
✅ Demo accounts can login
✅ Dark mode works throughout
✅ Admin panel is functional
✅ No errors in logs
✅ Services stay running

---

**Deployment Status**: 
- [ ] Not Started
- [ ] In Progress
- [ ] Complete
- [ ] Verified

**Last Updated**: [Date/Time]

---

🎃 **Ready for Kiroween submission!** 👻
