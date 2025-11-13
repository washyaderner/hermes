import bcrypt from "bcryptjs";
import { generateId } from "@/lib/utils";

// Password validation requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requireLetters: true,
  requireNumbers: true,
  requireSymbols: true,
};

// In-memory user store (replace with database in production)
// Format: { username: { hashedPassword, failedAttempts, lockedUntil } }
const userStore = new Map<string, {
  hashedPassword: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
}>();

// Initialize default user (for MVP - replace with proper user creation flow)
// Password: "SecurePassword123!" (will be hashed on first run)
const DEFAULT_USERNAME = "russ";
const DEFAULT_PASSWORD = "SecurePassword123!";

// Initialize default user if not exists
async function initializeDefaultUser() {
  if (!userStore.has(DEFAULT_USERNAME)) {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    userStore.set(DEFAULT_USERNAME, {
      hashedPassword,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
    });
  }
}

// Validate password meets requirements
export function validatePasswordRequirements(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireLetters && !/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (PASSWORD_REQUIREMENTS.requireSymbols && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one symbol");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Hash password with bcrypt (12 salt rounds)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password against hash
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Check if account is locked
export function isAccountLocked(username: string): boolean {
  const user = userStore.get(username);
  if (!user) return false;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true;
  }

  // Unlock if lock period has expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    user.lockedUntil = null;
    user.failedAttempts = 0;
  }

  return false;
}

// Record failed login attempt with exponential backoff
export function recordFailedLoginAttempt(username: string): {
  isLocked: boolean;
  lockUntil: Date | null;
  attemptsRemaining: number;
} {
  const user = userStore.get(username);
  if (!user) {
    // Don't reveal if user exists
    return { isLocked: false, lockUntil: null, attemptsRemaining: 4 };
  }

  user.failedAttempts += 1;

  // Lock account after 5 failed attempts
  if (user.failedAttempts >= 5) {
    // Exponential backoff: 2^(attempts-5) minutes
    const lockMinutes = Math.pow(2, Math.min(user.failedAttempts - 5, 5));
    user.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    return {
      isLocked: true,
      lockUntil: user.lockedUntil,
      attemptsRemaining: 0,
    };
  }

  return {
    isLocked: false,
    lockUntil: null,
    attemptsRemaining: 5 - user.failedAttempts,
  };
}

// Reset failed login attempts on successful login
export function resetFailedLoginAttempts(username: string): void {
  const user = userStore.get(username);
  if (user) {
    user.failedAttempts = 0;
    user.lockedUntil = null;
  }
}

// Authenticate user
export async function authenticateUser(
  username: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  lockUntil?: Date;
  attemptsRemaining?: number;
}> {
  // Initialize default user if needed
  await initializeDefaultUser();

  // Check if account is locked
  if (isAccountLocked(username)) {
    const user = userStore.get(username);
    return {
      success: false,
      error: "Account is temporarily locked due to too many failed login attempts",
      lockUntil: user?.lockedUntil || undefined,
    };
  }

  const user = userStore.get(username);
  if (!user) {
    // Don't reveal if user exists - record attempt anyway
    recordFailedLoginAttempt(username);
    return {
      success: false,
      error: "Invalid credentials",
      attemptsRemaining: 4,
    };
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.hashedPassword);
  if (!isPasswordValid) {
    const lockInfo = recordFailedLoginAttempt(username);
    return {
      success: false,
      error: "Invalid credentials",
      lockUntil: lockInfo.lockUntil || undefined,
      attemptsRemaining: lockInfo.attemptsRemaining,
    };
  }

  // Reset failed attempts on successful login
  resetFailedLoginAttempts(username);

  return { success: true };
}

// Create new user (for future registration flow)
export async function createUser(
  username: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  // Validate password requirements
  const validation = validatePasswordRequirements(password);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(", "),
    };
  }

  // Check if user already exists
  if (userStore.has(username)) {
    return {
      success: false,
      error: "Username already exists",
    };
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  userStore.set(username, {
    hashedPassword,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
  });

  return { success: true };
}

// Get user info (without sensitive data)
export function getUserInfo(username: string): {
  username: string;
  createdAt: Date;
  isLocked: boolean;
} | null {
  const user = userStore.get(username);
  if (!user) return null;

  return {
    username,
    createdAt: user.createdAt,
    isLocked: isAccountLocked(username),
  };
}

