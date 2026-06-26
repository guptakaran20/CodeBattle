import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Enable default Node.js metrics (memory, CPU, Event Loop, etc.)
client.collectDefaultMetrics();

// Custom Metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const activeBattlesGauge = new client.Gauge({
  name: 'active_battles_total',
  help: 'Current number of active battles'
});

export const totalSubmissionsCounter = new client.Counter({
  name: 'submissions_total',
  help: 'Total number of code submissions'
});

export const judge0LatencyHistogram = new client.Histogram({
  name: 'judge0_latency_seconds',
  help: 'Latency of Judge0 evaluation',
  buckets: [0.5, 1, 2, 5, 10]
});

// Middleware to track HTTP requests
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip metrics for metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const durationSeconds = elapsed[0] + elapsed[1] / 1e9;
    
    // Simplistic route path to avoid cardinality explosion with IDs
    let route = req.path;
    if (route.startsWith('/api/battles/')) route = '/api/battles/:id';
    if (route.startsWith('/api/problems/')) route = '/api/problems/:slug';
    if (route.startsWith('/api/users/')) route = '/api/users/:id';
    if (route.startsWith('/api/submissions/')) route = '/api/submissions/:id';

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(durationSeconds);
      
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
};

export const getMetrics = async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
