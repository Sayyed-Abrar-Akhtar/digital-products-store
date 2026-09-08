export interface AuthContext {
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
  isDevFallback?: boolean;
  warningMessage?: string;
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized: Admin authentication is required.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Server-side authorization boundary helper for internal admin operations.
 *
 * NOTE: Real authentication infrastructure (e.g. NextAuth, Clerk, or JWT sessions)
 * is pending the dedicated authentication milestone.
 *
 * To prevent false security claims:
 * - Production execution without real auth will strictly throw an AuthorizationError.
 * - Development execution permits admin management for initial product setup, but explicitly flags
 *   that real auth is not yet active.
 */
export async function getAdminAuthContext(): Promise<AuthContext> {
  const isProduction = process.env.NODE_ENV === "production";
  const allowDevUnauthenticated = process.env.ALLOW_DEV_ADMIN_UNAUTHENTICATED !== "false";

  // When real auth headers or cookies are integrated in the future, evaluate them here:
  // e.g., const session = await getSession();

  if (isProduction) {
    return {
      isAuthenticated: false,
      warningMessage:
        "CRITICAL: Admin access is disabled in production environments because real authentication infrastructure is not yet implemented.",
    };
  }

  if (allowDevUnauthenticated) {
    return {
      isAuthenticated: true,
      role: "admin",
      isDevFallback: true,
      warningMessage:
        "DEVELOPMENT WARNING: Real authentication is pending. Admin operations are active in development mode only.",
    };
  }

  return {
    isAuthenticated: false,
    warningMessage: "Admin access is disabled.",
  };
}

/**
 * Asserts that the caller is authorized for admin actions.
 * Throws AuthorizationError if unauthorized.
 */
export async function assertAdminAuth(): Promise<AuthContext> {
  const context = await getAdminAuthContext();
  if (!context.isAuthenticated) {
    throw new AuthorizationError(
      context.warningMessage || "Unauthorized: Real authentication infrastructure is required for admin access."
    );
  }
  return context;
}
