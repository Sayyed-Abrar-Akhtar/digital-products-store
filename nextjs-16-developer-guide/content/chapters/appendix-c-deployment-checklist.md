# Appendix C: Deployment Checklist

*Appendix*

---

## Learning Objectives
- Master the production deployment checklist for Next.js 16 App Router applications.
- Verify containerization, standalone build outputs, health probes, and reverse proxy configurations.
- Achieve zero-downtime rolling releases across cloud host platforms.

---

## Overview & Core Explanation

Deploying Next.js 16 applications to production requires validating infrastructure settings, environment secret stores, container builds, and health probe endpoints.

This appendix provides a practical checklist for deploying Next.js 16 applications to production environments (Vercel, Docker containers, AWS App Runner, GCP Cloud Run, or Node.js VM clusters).

```text
                        DEPLOYMENT CHECKLIST PIPELINE
┌────────────────────────┬────────────────────────┬────────────────────────┐
│   BUILD PRE-FLIGHT     │     CONTAINER & ENV    │    ROUTING & HEALTH    │
│                        │                        │                        │
│ • npm run build        │ • Docker standalone    │ • GET /api/health      │
│ • npx tsc --noEmit     │ • Non-root USER        │ • SSL/TLS HTTPS        │
│ • output: 'standalone' │ • Host Secret Store    │ • Rolling Deployments  │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## Deployment Pre-Flight Checklist

### 1. Build & Compilation Verification
- [ ] **Clean Compilation**: `npm run build` completes with zero TypeScript or ESLint errors.
- [ ] **Standalone Output**: `next.config.ts` configures `output: 'standalone'` for lightweight container image tracing (<80MB).
- [ ] **Local Production Test**: `npm run build && npm run start` runs cleanly on local developer machines before deployment.

### 2. Environment Variables & Secret Security
- [ ] **Secret Isolation**: Zero private database credentials or API secrets feature the `NEXT_PUBLIC_` prefix.
- [ ] **Host Secret Store**: Secrets are injected via cloud provider secret managers (Vercel Env, AWS Secrets Manager, GitHub Secrets) rather than `.env.production` files.
- [ ] **Startup Validation**: `lib/env.ts` validates environment variables with Zod during server startup.

### 3. Container & Infrastructure Security
- [ ] **Non-Root System User**: Dockerfile executes Node processes as a non-root system user (`USER nextjs`).
- [ ] **Health Probe Endpoint**: Exposes `/api/health` returning HTTP 200 with database connectivity verification.
- [ ] **Network Binding**: Container sets `ENV HOSTNAME "0.0.0.0"` to accept external proxy connections.

### 4. Reverse Proxy & Domain Security
- [ ] **SSL/TLS Termination**: HTTPS certificates configured with automated renewal (Let's Encrypt / Cloudflare).
- [ ] **CORS Configuration**: Route Handlers restrict `Access-Control-Allow-Origin` strictly to authorized domain origins.
- [ ] **Staging No-Index**: Staging and preview deployments configure `robots: { index: false }` to block search engine indexing.

---

## Practical Example

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    // Verify database connectivity
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

## Common Mistakes

1. **Deploying Containers Executing as Root**: Running Node processes as root inside Docker containers, exposing host systems to root privilege escalation.
2. **Missing Health Probe Routes**: Deploying containers without `/api/health` routes, causing load balancers to route live traffic to unhealthy container instances.
3. **Hardcoding Development URLs in Production**: Forgetting to update `NEXT_PUBLIC_APP_URL` from `http://localhost:3000` to the live HTTPS domain.

---

## Production Considerations

- **Rolling Deployments**: Ensure load balancers wait for new container instances to pass `/api/health` probes before terminating old container instances.
- **Log Aggregation**: Pipe `stdout` and `stderr` logs to centralized log aggregators (Datadog, CloudWatch) for real-time monitoring.

---

## Summary

Executing this deployment checklist guarantees that your Next.js 16 container or serverless deployment is secure, portable, and configured for zero-downtime production releases.

---

## Checklist
- [ ] Verified `output: 'standalone'` in `next.config.ts`.
- [ ] Tested `/api/health` probe returns HTTP 200 on healthy database connection.
- [ ] Secured secrets inside cloud host secret managers.
- [ ] Configured HTTPS SSL/TLS certificates for production domain URLs.
