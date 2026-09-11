# Chapter 39: Deployment

*Part VIII — Deployment*

---

## Learning Objectives
- Deploy Next.js 16 App Router applications across major cloud platforms (Vercel, Docker containers, Node.js standalone servers, AWS App Runner).
- Construct production-grade multi-stage `Dockerfile` configurations leveraging `output: 'standalone'`.
- Implement server health check endpoints (`/api/health`) for load balancer health probes.
- Configure Nginx reverse proxies and SSL/TLS termination.
- Achieve zero-downtime rolling deployments and automated CI/CD releases.

---

## Overview & Core Explanation

Deploying Next.js 16 applications requires choosing a target hosting platform that matches your team's operational requirements:

1. **Managed Serverless / Edge Platforms (Vercel, Netlify)**: Provides zero-configuration global CDN distribution, automatic preview deployments, and managed serverless function scaling.
2. **Containerized Deployments (Docker / Kubernetes / AWS App Runner / GCP Cloud Run)**: Provides complete infrastructure control, portable container builds, and predictable hosting costs using Next.js 16's `output: 'standalone'` engine.
3. **Custom Node.js Standalone Servers (Linux VMs / EC2)**: Runs Next.js as a persistent Node.js process managed by PM2 behind an Nginx reverse proxy.

```
                          DEPLOYMENT ARCHITECTURE OPTIONS
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│     MANAGED EDGE        │       DOCKER / CONTAINER │     CUSTOM NODE SERVER  │
│     (Vercel / Netlify)  │  (AWS App Runner / K8s) │     (Ubuntu VM / EC2)   │
│                         │                         │                         │
│ • Zero Config           │ • Portable Container    │ • Persistent Node Process│
│ • Global Edge CDN       │ • Multi-Stage Dockerfile│ • PM2 Process Manager   │
│ • Auto Serverless       │ • Standalone Build (<80MB)│ • Nginx Reverse Proxy   │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## Production Multi-Stage `Dockerfile`

For containerized deployments, create an optimized multi-stage `Dockerfile` that compiles the project and packages only the `output: 'standalone'` build files into a minimal Alpine Linux image.

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable standalone output tracing in next.config.ts
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner (Production Image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-rendered static assets and standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Server Health Check Endpoint (`app/api/health/route.ts`)

Cloud load balancers and container orchestrators (Kubernetes, AWS App Runner) periodically ping a health probe route to verify container health before routing traffic.

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    // 1. Verify database connectivity
    await dbConnect();

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        reason: "Database connection failed",
        error: err.message,
      },
      { status: 503 }
    );
  }
}
```

---

## Nginx Reverse Proxy Configuration

When hosting on a custom Linux VM, configure Nginx as a reverse proxy to manage SSL/TLS termination and route HTTP requests to Node.js on port 3000.

```nginx
# /etc/nginx/sites-available/acme-app
server {
    listen 80;
    server_name acme-app.store.com;
    return 311 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name acme-app.store.com;

    ssl_certificate /etc/letsencrypt/live/acme-app.store.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/acme-app.store.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Deployment Strategy Decision Matrix

| Deployment Strategy | Pros | Cons | Ideal Use Case |
| :--- | :--- | :--- | :--- |
| **Managed Serverless (Vercel)** | Zero ops overhead, instant edge CDN, automatic preview URLs. | Variable invocation costs at high traffic scales. | Fast-growing SaaS products, startup MVP launches. |
| **Docker Containers (AWS App Runner / Cloud Run)** | Portable container builds, predictable pricing, multi-cloud capability. | Requires Dockerfile maintenance and container orchestration setup. | Enterprise applications with strict compliance or custom container requirements. |
| **Node.js PM2 + Nginx VM** | Lowest hosting cost for fixed high traffic. | Manual server OS patching, SSL certificate management, and scaling configuration. | Dedicated infrastructure or on-premise deployments. |

---

## Practical Example
In our reference application (**Acme App**), this pattern is utilized across Server Components and Server Actions to ensure consistent architecture.

```typescript
// Practical implementation snippet for Next.js 16 (Target 16.3.4)
export async function executePracticalWorkflow() {
  return { success: true, timestamp: new Date().toISOString() };
}
```

## Common Mistakes

1. **Running Docker Containers as Root User**: Omitting non-root user setup (`USER nextjs`) in Dockerfiles.
   - *Security Risk*: If a container vulnerability is exploited, the attacker gains root privilege on the container host.
2. **Missing Health Probes**: Deploying containerized services without configuring load balancer health probe endpoints (`/api/health`), causing broken container deployments to receive live user traffic.
3. **Omitting `HOSTNAME: "0.0.0.0"` in Standalone Containers**: Binding standalone Node servers strictly to `localhost` inside Docker containers, preventing external container network access.

---

## Production Considerations

- **Zero-Downtime Rolling Deploys**: Use rolling update strategies in Kubernetes or AWS App Runner so new container instances pass health checks before old instances are terminated.
- **SSL/TLS Automated Renewal**: Use Let's Encrypt Certbot for automated HTTPS certificate renewals on custom VM proxies.
- **Log Aggregation**: Pipe `stdout` / `stderr` container logs to centralized logging systems (Datadog, CloudWatch, Papertrail) for real-time monitoring.

---

## Summary

Next.js 16 applications can be deployed seamlessly across managed serverless platforms, Docker containers, and standalone Node.js environments. By leveraging multi-stage Docker builds, health check probes (`/api/health`), and reverse proxy configurations, you achieve secure, zero-downtime production deployments.

---

## Checklist
- [ ] Constructed multi-stage Dockerfile leveraging `output: 'standalone'`.
- [ ] Created health probe endpoint (`/api/health`) verifying database connectivity.
- [ ] Executed Docker containers using non-root system users (`USER nextjs`).
- [ ] Configured HTTPS SSL/TLS termination on custom reverse proxies (Nginx / Cloudflare).
- [ ] Implemented zero-downtime rolling deployment strategies in deployment pipelines.
