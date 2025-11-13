# Performance Testing Guide

## Overview

This guide covers performance testing and optimization strategies for the Campus Portal Backend API.

## Performance Testing Tools

### 1. Artillery.io (Recommended for Load Testing)

Artillery is a modern load testing tool with YAML configuration.

#### Installation

```bash
npm install -g artillery
# or
npm install --save-dev artillery
```

#### Basic Load Test

Create `tests/performance/load-test.yml`:

```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 60
      arrivalRate: 100
      name: "Spike"
  processor: "./load-test-processor.js"
  plugins:
    expect: {}

scenarios:
  - name: "User Login Flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "student@example.com"
            password: "testpass123"
          expect:
            - statusCode: 200
          capture:
            json: "$.data.token"
            as: "token"
      - get:
          url: "/api/courses"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
      - get:
          url: "/api/announcements"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200

  - name: "Course Enrollment Flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "student@example.com"
            password: "testpass123"
          capture:
            json: "$.data.token"
            as: "token"
      - get:
          url: "/api/courses"
          headers:
            Authorization: "Bearer {{ token }}"
          capture:
            json: "$[0]._id"
            as: "courseId"
      - post:
          url: "/api/courses/{{ courseId }}/enroll"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200

  - name: "View Announcements"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "student@example.com"
            password: "testpass123"
          capture:
            json: "$.data.token"
            as: "token"
      - get:
          url: "/api/announcements"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - contentType: json
```

Create `tests/performance/load-test-processor.js`:

```javascript
module.exports = {
  beforeRequest: function(requestParams, context, ee, next) {
    // Add custom headers or modify request before sending
    return next();
  },
  afterResponse: function(requestParams, response, context, ee, next) {
    // Process response, extract data for later use
    return next();
  }
};
```

#### Running Load Tests

```bash
# Run load test
artillery run tests/performance/load-test.yml

# Run with HTML report
artillery run tests/performance/load-test.yml --output results.json
artillery report results.json

# Run with detailed output
artillery run tests/performance/load-test.yml -v

# Run continuously for 1 hour
artillery run tests/performance/load-test.yml --duration 3600
```

### 2. K6 (Alternative Load Testing)

K6 is a modern load testing tool with JavaScript scripting.

#### Installation

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

#### K6 Test Script

Create `tests/performance/k6-load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up
    { duration: '1m30s', target: 100 }, // Stay at 100
    { duration: '20s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3001/api';

export default function() {
  // Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'student@example.com',
    password: 'testpass123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('data.token') !== undefined,
  });

  const token = loginRes.json('data.token');
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Get courses
  const coursesRes = http.get(`${BASE_URL}/courses`, params);
  check(coursesRes, {
    'get courses successful': (r) => r.status === 200,
  });

  sleep(1);

  // Get announcements
  const announcementsRes = http.get(`${BASE_URL}/announcements`, params);
  check(announcementsRes, {
    'get announcements successful': (r) => r.status === 200,
  });

  sleep(1);
}
```

#### Running K6 Tests

```bash
# Basic run
k6 run tests/performance/k6-load-test.js

# Generate JSON results
k6 run tests/performance/k6-load-test.js -o json=results.json

# Run with summary report
k6 run tests/performance/k6-load-test.js --summary-trend-stats "avg,min,max,p(95),p(99)"

# Cloud run (with k6 account)
k6 cloud tests/performance/k6-load-test.js
```

## Performance Monitoring

### 1. Application Metrics

Monitor with `npm` scripts for performance profiling:

```bash
# CPU profiling
node --prof src/index.js
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --expose-gc src/index.js
```

### 2. Database Query Performance

Monitor MongoDB queries:

```javascript
// In src/index.js
mongoose.set('debug', true);

// Or in development:
mongoose.set('debug', (collection, method, query, doc) => {
  console.log(`${collection}.${method}`, JSON.stringify(query), doc);
});
```

### 3. Request Timing

```bash
# Install apache-bench
brew install httpd

# Test endpoint
ab -n 1000 -c 100 http://localhost:3001/api/courses
```

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| Response Time (p95) | < 200ms | < 500ms |
| Response Time (p99) | < 500ms | < 1000ms |
| Error Rate | < 0.1% | < 1% |
| Throughput | > 1000 req/s | > 500 req/s |
| Memory Usage | < 500MB | < 1GB |
| CPU Usage | < 80% | < 95% |

### Sample Results

After optimization, expected results:

```
Login Endpoint:
- p50: 45ms
- p95: 120ms
- p99: 250ms

Course List (50 courses):
- p50: 65ms
- p95: 180ms
- p99: 350ms

Announcement List (100 items):
- p50: 75ms
- p95: 200ms
- p99: 400ms

Overall Throughput: 2500+ req/s
```

## Performance Optimization Strategies

### 1. Database Query Optimization

#### Add Indexes

```javascript
// In models - already implemented
courseSchema.index({ courseCode: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ semester: 1, year: 1 });
```

#### Use Lean Queries

```javascript
// Instead of
const courses = await Course.find();

// Use
const courses = await Course.find().lean();
```

#### Projection (Select Specific Fields)

```javascript
// Instead of
const user = await User.findById(userId);

// Use
const user = await User.findById(userId).select('firstName lastName email role');
```

### 2. API Response Optimization

#### Pagination

```javascript
// Implement pagination in courses route
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;

const courses = await Course.find()
  .skip(skip)
  .limit(limit)
  .lean();
```

#### Caching

```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/courses', async (req, res) => {
  const cacheKey = 'courses:list';
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Get from database
  const courses = await Course.find().lean();
  
  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(courses));
  
  res.json(courses);
});
```

### 3. API Gateway Strategies

#### Rate Limiting (Already Implemented)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 4. Load Balancing

For production, use nginx or HAProxy:

```nginx
upstream campus_portal_backend {
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://campus_portal_backend;
  }
}
```

## Continuous Performance Monitoring

### Setup APM (Application Performance Monitoring)

#### New Relic

```bash
npm install newrelic
```

Create `newrelic.js`:

```javascript
exports.config = {
  app_name: ['Campus Portal Backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
};
```

Import at app start:

```javascript
require('newrelic');
const express = require('express');
```

#### DataDog

```bash
npm install dd-trace
```

```javascript
const tracer = require('dd-trace').init();
```

## Performance Testing Checklist

- [ ] Establish baseline metrics
- [ ] Run load tests (100 concurrent users for 5 minutes)
- [ ] Run spike tests (sudden increase to 500 users)
- [ ] Test with realistic data volumes
- [ ] Monitor memory and CPU during tests
- [ ] Test database failover scenarios
- [ ] Test with high latency network conditions
- [ ] Run tests on staging environment
- [ ] Document results and share with team
- [ ] Implement monitoring in production
- [ ] Set up alerts for performance degradation

## Performance Testing Script

Create `scripts/performance-test.sh`:

```bash
#!/bin/bash

echo "🚀 Starting Performance Test Suite"
echo "=================================="

# Start application
echo "📱 Starting application..."
npm run dev &
APP_PID=$!

# Wait for app to start
sleep 5

# Start database
echo "📊 Starting MongoDB..."
mongod --dbpath ./data &
DB_PID=$!

# Wait for database
sleep 3

# Run seed
echo "🌱 Seeding database..."
npm run seed

# Run tests
echo "🧪 Running Artillery load tests..."
artillery run tests/performance/load-test.yml --output results.json

# Generate report
echo "📈 Generating report..."
artillery report results.json

# Cleanup
kill $APP_PID
kill $DB_PID

echo "✅ Performance testing complete!"
```

Make executable:

```bash
chmod +x scripts/performance-test.sh
./scripts/performance-test.sh
```

## Troubleshooting Performance Issues

### High CPU Usage
1. Check for inefficient queries
2. Monitor request processing time
3. Check for memory leaks with heap snapshots
4. Profile with `clinic.js`:
   ```bash
   npm install -g clinic
   clinic doctor -- node src/index.js
   ```

### High Memory Usage
1. Check for unclosed database connections
2. Monitor array/object accumulation
3. Check for memory leaks:
   ```bash
   node --expose-gc src/index.js
   # Then use clinic.js
   ```

### Slow Database Queries
1. Use MongoDB slow query log
2. Analyze query execution plans
3. Add appropriate indexes
4. Use `.lean()` for read-only queries
5. Implement pagination

### API Latency Spikes
1. Check database connection pool
2. Verify network latency
3. Monitor garbage collection
4. Check for cache misses
5. Review rate limiting impact

## References

- [Artillery.io Documentation](https://artillery.io/)
- [K6 Documentation](https://k6.io/docs/)
- [MongoDB Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
