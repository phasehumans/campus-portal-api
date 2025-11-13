# Campus Portal - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Production Checklist](#production-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm or yarn
- Git
- Docker (for containerized deployment)
- Cloud provider account (for cloud deployment)

---

## Local Development

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB**
   ```bash
   # Option 1: Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Option 2: Local MongoDB
   mongod
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

5. **Verify Installation**
   ```bash
   curl http://localhost:5000/health
   ```

### Development Environment Variables
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campus-portal
JWT_SECRET=dev_secret_key_change_in_production
SMTP_HOST=sandbox.smtp.mailtrap.io
# ... other settings
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: campus-portal-api
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/campus-portal
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - campus-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  mongo:
    image: mongo:6.0-alpine
    container_name: campus-portal-mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=campus-portal
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    networks:
      - campus-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  campus-network:
    driver: bridge

volumes:
  mongo_data:
    driver: local
```

### Build and Run

```bash
# Build image
docker build -t campus-portal-api:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/campus-portal \
  -e JWT_SECRET=your_secret \
  --name campus-api \
  campus-portal-api:latest

# Using Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Clean up
docker-compose down -v
```

### Docker Registry (Docker Hub)

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag campus-portal-api:latest username/campus-portal-api:latest

# Push to registry
docker push username/campus-portal-api:latest

# Pull from registry
docker pull username/campus-portal-api:latest
```

---

## Heroku Deployment

### Prerequisites
- Heroku Account
- Heroku CLI installed
- Git repository initialized

### Steps

1. **Create Heroku App**
   ```bash
   heroku login
   heroku create campus-portal-api
   ```

2. **Add MongoDB Atlas**
   ```bash
   # Create cluster at mongodb.com
   # Get connection string
   heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster..."
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_production_secret
   heroku config:set SMTP_HOST=sandbox.smtp.mailtrap.io
   heroku config:set SMTP_USER=your_user
   heroku config:set SMTP_PASSWORD=your_password
   heroku config:set NODE_ENV=production
   ```

4. **Create Procfile**
   ```
   web: npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View Logs**
   ```bash
   heroku logs --tail
   ```

7. **Scale Dynos** (if needed)
   ```bash
   heroku ps:scale web=2
   ```

### Heroku Monitoring

```bash
# Check app status
heroku ps

# View metrics
heroku logs

# SSH into dyno
heroku run bash

# Run seeds
heroku run npm run seed
```

---

## AWS Deployment

### EC2 Setup

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.micro (free tier)
   - Security Group: Allow SSH (22), HTTP (80), HTTPS (443), API (5000)

2. **Connect and Install**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Clone repository
   git clone <repo-url>
   cd campus-portal
   npm install
   ```

3. **Configure Application**
   ```bash
   cp .env.example .env
   # Edit .env with production settings
   nano .env
   ```

4. **Set Up Reverse Proxy (Nginx)**
   ```bash
   sudo apt install -y nginx
   
   sudo tee /etc/nginx/sites-available/campus-portal > /dev/null <<EOF
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   sudo ln -s /etc/nginx/sites-available/campus-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Set Up PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   cd campus-portal
   pm2 start src/index.js --name "campus-portal"
   pm2 startup
   pm2 save
   ```

6. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### RDS (Managed MongoDB Alternative)

```bash
# Create RDS cluster (MongoDB compatible)
# Configure security group
# Get connection string
# Set MONGODB_URI in .env
```

---

## MongoDB Atlas Setup

### Create Free Cluster

1. Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create account
3. Create organization and project
4. Create M0 (free) cluster
5. Configure IP whitelist
6. Create database user
7. Get connection string

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/campus-portal?retryWrites=true&w=majority
```

### Set in Application
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-portal
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] Change all default credentials
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set rate limiting appropriately
- [ ] Enable request validation
- [ ] Use environment variables for secrets
- [ ] Regular security audits

### Database
- [ ] Use managed database service (Atlas, RDS)
- [ ] Enable database backups
- [ ] Configure replication
- [ ] Set up monitoring
- [ ] Create indexes as specified
- [ ] Configure connection pooling

### Performance
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Implement caching strategies
- [ ] Use load balancer for horizontal scaling
- [ ] Configure auto-scaling

### Monitoring & Logging
- [ ] Set up application logging
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring (New Relic, Datadog)
- [ ] Configure health checks
- [ ] Set up alerting

### Deployment
- [ ] Automate deployments (CI/CD)
- [ ] Version your releases
- [ ] Document deployment procedures
- [ ] Test in staging environment
- [ ] Plan rollback strategy
- [ ] Schedule maintenance windows

### Backup & Recovery
- [ ] Regular database backups
- [ ] Test restore procedures
- [ ] Document recovery procedures
- [ ] Keep backup offsite
- [ ] Monitor backup status

---

## Monitoring & Maintenance

### Application Monitoring

```bash
# Using PM2 (EC2)
pm2 monit

# View logs
pm2 logs campus-portal

# Restart application
pm2 restart campus-portal
```

### Database Monitoring

```bash
# MongoDB connection check
mongosh "mongodb+srv://user:pass@cluster..."

# Check database size
db.stats()

# Monitor collections
db.collection.stats()
```

### Health Checks

```bash
# Application health
curl http://localhost:5000/health

# API status
curl http://localhost:5000/api
```

### Log Analysis

```bash
# View error logs
docker-compose logs api | grep ERROR

# Real-time logs
docker-compose logs -f api

# Save logs to file
docker-compose logs > logs.txt
```

### Backup Procedures

```bash
# MongoDB backup
mongodump --uri "mongodb+srv://..." --out ./backup

# Restore backup
mongorestore ./backup

# Automated backup script
0 2 * * * /path/to/backup-script.sh
```

### Performance Optimization

1. **Database Optimization**
   - Verify all indexes are created
   - Monitor slow queries
   - Optimize queries with explain()

2. **Application Optimization**
   - Use caching (Redis)
   - Implement async processing
   - Optimize API endpoints

3. **Infrastructure Optimization**
   - Use load balancing
   - Implement horizontal scaling
   - Use CDN for static files

### Update & Patching

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Update specific package
npm update express

# Check for outdated packages
npm outdated
```

### Rollback Procedures

```bash
# Docker rollback
docker-compose up -d previous-version-image

# Heroku rollback
heroku releases
heroku rollback v42

# Git rollback
git revert commit-hash
git push origin main
```

---

## Troubleshooting Deployment

### Application Won't Start
```bash
# Check logs
docker-compose logs api
heroku logs --tail

# Verify environment variables
echo $MONGODB_URI
echo $JWT_SECRET

# Test locally first
npm run dev
```

### Database Connection Failed
```bash
# Test connection
mongosh "your-connection-string"

# Verify IP whitelist (Atlas)
# Verify security group rules (EC2)
# Check firewall (local)
```

### High Memory Usage
```bash
# Check memory
free -h

# Monitor process
top

# Increase node heap
export NODE_OPTIONS="--max-old-space-size=2048"
npm start
```

### Slow Requests
```bash
# Check database indexes
db.collection.getIndexes()

# Analyze slow queries
db.setProfilingLevel(1)

# Check application logs for bottlenecks
```

---

## Production Environment Template

```bash
# .env.production
PORT=5000
NODE_ENV=production
LOG_LEVEL=info

# Database (use managed service)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campus-portal

# JWT (use strong secret)
JWT_SECRET=very_long_random_string_min_32_chars
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=prod_user
SMTP_PASSWORD=prod_password
MAIL_FROM=noreply@campusportal.com

# API
API_URL=https://api.campusportal.com
CLIENT_URL=https://campusportal.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

---

**Last Updated:** November 13, 2024
**Version:** 1.0.0
