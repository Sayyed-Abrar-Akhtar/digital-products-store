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
