# Chapter 2: Creating a Next.js 16 Project

*Part I — Modern Next.js*

---

## Learning Objectives
- Master modern project initialization using `create-next-app` with target version Next.js 16.3.4.
- Configure strict TypeScript settings (`tsconfig.json`) aligned with React 19 and Next.js App Router.
- Structure environment variable configurations (`.env.local`, `.env.production`) and strict runtime schema validation.
- Implement production-grade Next.js configuration (`next.config.ts`) incorporating security headers and image domain security.
- Establish automated build scripts and validation pipelines (`typecheck`, `lint`, `build`).

---

## Overview & Core Explanation

Starting a enterprise-ready Next.js 16 project requires deliberate choices regarding project layout, package management, compiler options, and environment handling. A naive setup can accumulate technical debt in type checking, build times, and deployment reliability.

### Official CLI Scaffolding (`create-next-app`)
The primary entry point for initializing a Next.js 16 application is `create-next-app`. In Next.js 16, the CLI defaults to App Router, TypeScript, and Tailwind CSS.

To initialize a Next.js 16.3.4 project non-interactively using modern defaults:

```bash
npx create-next-app@16.3.4 acme-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm
```

### Key Configuration Artifacts

#### 1. TypeScript Configuration (`tsconfig.json`)
Next.js 16 automatically generates and manages `tsconfig.json`. When targeting React 19 and Next.js 16, specific compiler options ensure strict type safety without interfering with Next.js route generation:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- `"moduleResolution": "bundler"`: Configures TypeScript to match modern bundlers (like Turbopack and Webpack 5), correctly resolving conditional exports in React 19 packages.
- `"plugins": [{ "name": "next" }]`: Enables the Next.js TypeScript language service plugin, providing auto-completion for dynamic route parameters and route handlers.

#### 2. Framework Configuration (`next.config.ts`)
Next.js 16 natively supports TypeScript for configuration files (`next.config.ts`), removing the need for `next.config.js` or custom transpilation scripts.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce React Strict Mode for detecting side effects in React 19
  reactStrictMode: true,

  // Disable 'X-Powered-By: Next.js' header for basic security hardening
  poweredByHeader: false,

  // Enable Next.js Typed Routes for route parameter type safety
  experimental: {
    typedRoutes: true,
  },

  // Secure Image Optimization domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sayyedabrarakhtar.com.np",
        port: "",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## Practical Example

In our reference **Acme App**, we enforce strict runtime validation for environment variables during application startup to prevent silent failures in production.

### 1. Environment Variable Schema (`lib/env.ts`)
```typescript
import "server-only";

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  siteUrl: string;
  mongoUri: string;
  adminSecret: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`CRITICAL CONFIG ERROR: Environment variable '${key}' is missing.`);
  }
  return value;
}

export function getAppConfig(): AppConfig {
  // Sensitive secrets (like ADMIN_AUTH_SECRET) MUST be supplied via environment configuration (.env.local)
  // and MUST NOT normalize insecure in-code default fallback strings.
  return {
    nodeEnv: (process.env.NODE_ENV || "development") as AppConfig["nodeEnv"],
    siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    mongoUri: getEnvVar("MONGODB_URI", "mongodb://localhost:27017/acme_dev"),
    adminSecret: getEnvVar("ADMIN_AUTH_SECRET"),
  };
}
```

### 2. Package Dependency Definitions (`package.json`)
```json
{
  "name": "acme-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "server-only": "^0.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "16.3.4",
    "typescript": "^5.3.3"
  }
}
```

---

## Common Mistakes

1. **Mismatching React 19 Type Definitions**: Installing `@types/react@^18.0.0` while using React 19, leading to errors with `React.JSX.Element` and modern children props.
   - *Fix*: Ensure `@types/react` and `@types/react-dom` match React 19 (`^19.0.0`).
2. **Hardcoding Environment Variables in Client Components**: Referencing non-`NEXT_PUBLIC_` variables in files rendered on the browser, resulting in `undefined` values at runtime.
   - *Fix*: Prefix variables intended for client consumption with `NEXT_PUBLIC_`. Keep secret keys unprefixed and access them exclusively in Server Components or API handlers.
3. **Omitting `--noEmit` in CI Pipelines**: Assuming `next build` catches all TypeScript errors. `next build` optimizes build speed and can skip subtle type checks depending on configuration.
   - *Fix*: Always execute `npm run typecheck` (`tsc --noEmit`) as an explicit step in continuous integration scripts.

---

## Production Considerations

- **Git Hygiene**: Always commit `.gitignore` containing `.next/`, `node_modules/`, and `.env*.local`. Never commit production secrets or local database connections.
- **Node.js Engine Constraints**: Specify engine requirements in `package.json` (`"engines": { "node": ">=20.0.0" }`) to ensure hosting providers (such as Vercel, AWS Amplify, or Docker containers) build with a compatible Node runtime.
- **Security Headers**: Extend `next.config.ts` to supply standard HTTP security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) when serving production responses.

---

## Summary

Creating a Next.js 16 project requires setting up package dependencies, TypeScript options, and runtime environment validations correctly from day one. By standardizing on `next.config.ts`, strict environment schemas, and Turbopack dev workflows, developers establish a solid base for enterprise App Router development.

---

## Checklist
- [ ] Initialized project using `create-next-app` targeting Next.js 16.3.4.
- [ ] Configured `tsconfig.json` with `"moduleResolution": "bundler"` and Next.js plugin.
- [ ] Created `next.config.ts` with explicit type safety and `poweredByHeader: false`.
- [ ] Verified `.gitignore` prevents `.next/`, `node_modules/`, and `.env.local` from entering source control.
- [ ] Added explicit `"typecheck": "tsc --noEmit"` script to `package.json`.
