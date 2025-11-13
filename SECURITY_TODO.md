# Security Implementation Todo List

This document tracks all security improvements needed to bring Hermes up to production security standards.

**Last Updated**: 2025-01-XX  
**Status**: Planning Phase

---

## Priority 1: Critical Security (Authentication & Authorization)

### 1.1 Replace Hardcoded Authentication ✅ COMPLETED
- [X] **File**: `app/auth/login/page.tsx`
- [X] **Current Issue**: Hardcoded credentials (russ/password)
- [X] **Tasks**:
  - [X] Install bcrypt: `npm install bcryptjs @types/bcryptjs`
  - [X] Create user model/schema (if using database) or user service
  - [X] Implement password hashing with bcrypt (salt rounds: 12)
  - [X] Add password validation (min 12 chars, letters, numbers, symbols)
  - [X] Remove hardcoded credentials
  - [X] Add account lockout after 5 failed attempts with exponential backoff
  - [X] Store failed login attempts in memory/Redis (not localStorage)
- [X] **Dependencies**: Database setup (if using DB) or user storage solution
- [ ] **Testing**: Unit tests for password hashing, validation, lockout logic
- **Files Created**: `lib/auth/user-service.ts`
- **Default Credentials**: russ / SecurePassword123!

### 1.2 Implement Secure Session Management ✅ COMPLETED
- [X] **Files**: `app/auth/login/page.tsx`, `app/dashboard/page.tsx`, `app/page.tsx`
- [X] **Current Issue**: Using localStorage for session tokens
- [X] **Tasks**:
  - [X] Generate secure session tokens with `crypto.randomBytes(32)`
  - [X] Create session management service/API route
  - [X] Use httpOnly, secure, SameSite cookies instead of localStorage
  - [X] Implement session timeout (30 minutes inactivity)
  - [X] Add session regeneration on login
  - [X] Implement session invalidation on logout
  - [X] Add session cleanup on password reset
- [X] **Dependencies**: Cookie handling middleware, session storage (Redis recommended)
- [ ] **Testing**: Session creation, expiration, invalidation tests
- **Files Created**: `lib/auth/session-service.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/session/route.ts`

### 1.3 Add API Authentication Middleware ✅ COMPLETED
- [X] **Files**: 
  - `app/api/enhance/route.ts`
  - `app/api/v1/enhance/route.ts`
  - `app/api/analyze/route.ts`
  - `app/api/v1/analyze/route.ts`
  - `app/api/platforms/route.ts`
  - `app/api/v1/platforms/route.ts`
- [X] **Current Issue**: No authentication checks on API endpoints
- [X] **Tasks**:
  - [X] Create authentication middleware (`lib/middleware/auth.ts`)
  - [X] Verify JWT tokens or session tokens on all endpoints
  - [X] Return 401 Unauthorized for invalid/missing tokens
  - [X] Add user context to request (user ID, permissions)
  - [ ] Implement role-based access control (RBAC) if needed
- [X] **Dependencies**: Session management (1.2)
- [ ] **Testing**: API endpoint auth tests, unauthorized access tests
- **Files Created**: `lib/middleware/auth.ts`

---

## Priority 2: API Security

### 2.1 Implement Rate Limiting ✅ COMPLETED
- [X] **Files**: All API route files, create `lib/middleware/rateLimit.ts`
- [X] **Current Issue**: No rate limiting implemented
- [X] **Tasks**:
  - [X] Install rate limiting library: `npm install express-rate-limit` or use in-memory/Redis solution
  - [X] Create rate limit middleware (100 requests per user per minute)
  - [X] Apply to all API endpoints
  - [X] Return 429 Too Many Requests with Retry-After header
  - [X] Different limits for different endpoints (enhance vs analyze)
  - [X] Store rate limit data per user/session
- [X] **Dependencies**: Session management (1.2) or IP-based tracking
- [ ] **Testing**: Rate limit enforcement tests, burst request tests
- **Files Created**: `lib/middleware/rateLimit.ts`
- **Rate Limits**: 
  - Enhance: 50 req/min
  - Analyze: 200 req/min
  - Default: 100 req/min

### 2.2 Fix CORS Configuration ✅ COMPLETED
- [X] **Files**: 
  - `app/api/enhance/route.ts`
  - `app/api/v1/enhance/route.ts`
  - `app/api/analyze/route.ts`
  - `app/api/v1/analyze/route.ts`
  - `app/api/platforms/route.ts`
  - `app/api/v1/platforms/route.ts`
- [X] **Current Issue**: Wildcard `"*"` allowed origins
- [X] **Tasks**:
  - [X] Create environment variable `ALLOWED_ORIGINS` (comma-separated)
  - [X] Replace `"*"` with specific allowed origins from env
  - [X] Add CORS validation function
  - [X] Return 403 for disallowed origins
  - [X] Document allowed origins in `.env.example`
- [X] **Dependencies**: Environment variables setup (3.1)
- [ ] **Testing**: CORS validation tests, origin validation tests
- **Files Created**: `lib/utils/cors.ts`

### 2.3 Add Request Size Limits ✅ COMPLETED
- [X] **Files**: All API route files, `next.config.js`
- [X] **Current Issue**: No request size limits (DoS vulnerability)
- [X] **Tasks**:
  - [X] Configure Next.js body size limit in `next.config.js`
  - [X] Add request size validation in API routes
  - [X] Set reasonable limits per endpoint (e.g., 10KB for prompts)
  - [X] Return 413 Payload Too Large for oversized requests
- [X] **Dependencies**: None
- [ ] **Testing**: Request size limit tests
- **Files Created**: `lib/middleware/requestSize.ts`
- **Limits**: Enhance: 50KB, Analyze: 20KB, Default: 10KB, Platforms: 1KB

### 2.4 Improve Error Handling ✅ COMPLETED
- [X] **Files**: All API route files
- [X] **Current Issue**: May expose system details in errors
- [X] **Tasks**:
  - [X] Create error handling utility (`lib/utils/errors.ts`)
  - [X] Return generic error messages to clients
  - [X] Log detailed errors server-side only
  - [X] Never expose stack traces, file paths, or system info
  - [X] Use proper HTTP status codes (400, 401, 403, 404, 500)
  - [X] Add error context logging (without sensitive data)
- [X] **Dependencies**: Logging service (optional)
- [ ] **Testing**: Error handling tests, error message validation
- **Files Created**: `lib/utils/errors.ts`

---

## Priority 3: Configuration & Environment

### 3.1 Environment Variables Setup ✅ COMPLETED
- [X] **Files**: Create `.env.example`, update `README.md`
- [X] **Current Issue**: No `.env.example` file, no documentation
- [X] **Tasks**:
  - [X] Create `.env.example` with all required variables:
    - `DATABASE_URL` (if using database)
    - `SESSION_SECRET` (32+ byte random string)
    - `ALLOWED_ORIGINS` (comma-separated URLs)
    - `NODE_ENV` (development/production)
    - API keys (if needed): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
  - [X] Ensure `.env` is in `.gitignore`
  - [X] Document all variables in `README.md`
  - [ ] Add validation on app startup for required variables
  - [X] Never use `NEXT_PUBLIC_` prefix for sensitive data
- [X] **Dependencies**: None
- [ ] **Testing**: Environment variable validation tests
- **Files Created**: `.env.example`
- **Files Updated**: `README.md`

### 3.2 Security Headers Configuration ✅ COMPLETED
- [X] **File**: `next.config.js`
- [X] **Current Issue**: No security headers configured
- [X] **Tasks**:
  - [X] Install `next-secure-headers` or configure manually
  - [X] Add headers:
    - [X] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (production only)
    - [X] `X-Frame-Options: DENY`
    - [X] `X-Content-Type-Options: nosniff`
    - [X] `Content-Security-Policy: [configure for app]`
    - [X] `Referrer-Policy: strict-origin-when-cross-origin`
    - [X] `Permissions-Policy: [disable unnecessary features]`
  - [ ] Test headers in production build
- [X] **Dependencies**: None
- [ ] **Testing**: Header validation tests, CSP violation tests
- **Files Updated**: `next.config.js`
- **CSP Policy**: Configured for Next.js with Tailwind CSS

---

## Priority 4: Input Validation & Sanitization

### 4.1 Enhance Input Validation
- [ ] **Files**: 
  - `app/api/enhance/route.ts`
  - `app/api/v1/enhance/route.ts`
  - `app/auth/login/page.tsx`
  - All API routes
- [ ] **Current Issue**: Basic validation exists but needs enhancement
- [ ] **Tasks**:
  - [ ] Install validation library: `npm install zod` (recommended) or `joi`
  - [ ] Create validation schemas for all inputs
  - [ ] Add email format validation (if applicable)
  - [ ] Add URL validation (if applicable)
  - [ ] Add input length limits per field
  - [ ] Use allowlists (not blocklists) for acceptable patterns
  - [ ] Validate Content-Type headers
  - [ ] Add client-side validation (in addition to server-side)
- [ ] **Dependencies**: Validation library
- [ ] **Testing**: Input validation tests, edge case tests

### 4.2 Enhance Sanitization
- [ ] **Files**: `lib/security/sanitizer.ts` (already exists, enhance)
- [ ] **Current Issue**: Basic sanitization exists, needs enhancement
- [ ] **Tasks**:
  - [ ] Review and enhance HTML tag removal
  - [ ] Enhance script element removal
  - [ ] Add special character escaping for database queries
  - [ ] Add output encoding based on context (HTML, JavaScript, URL)
  - [ ] Periodically audit allow list for prompt injection patterns
  - [ ] Add sanitization for user-generated content before rendering
- [ ] **Dependencies**: None (uses existing security scanner)
- [ ] **Testing**: Sanitization tests, XSS prevention tests

---

## Priority 5: CSRF & XSS Protection

### 5.1 Implement CSRF Protection ✅ COMPLETED
- [X] **Files**: All API routes, create `lib/middleware/csrf.ts`
- [X] **Current Issue**: No CSRF tokens implemented
- [X] **Tasks**:
  - [X] Generate random CSRF tokens (crypto.randomBytes)
  - [X] Create CSRF middleware for state-changing operations
  - [X] Add CSRF token to forms and API requests
  - [X] Validate CSRF tokens on POST/PUT/PATCH/DELETE requests
  - [X] Set SameSite cookie attribute to 'Strict' or 'Lax' (already in session cookies)
  - [X] Return 403 Forbidden for invalid CSRF tokens
- [X] **Dependencies**: Session management (1.2)
- [ ] **Testing**: CSRF protection tests, token validation tests
- **Files Created**: `lib/middleware/csrf.ts`, `lib/utils/csrf-client.ts`, `app/api/auth/csrf-token/route.ts`
- **Protected Endpoints**: All POST endpoints except login

### 5.2 Enhance XSS Protection
- [ ] **Files**: All components rendering user content
- [ ] **Current Issue**: Need to ensure all user content is sanitized
- [ ] **Tasks**:
  - [ ] Audit all components that render user-generated content
  - [ ] Use React's built-in XSS protection (auto-escaping)
  - [ ] Avoid `dangerouslySetInnerHTML` unless absolutely necessary
  - [ ] Sanitize any HTML content before rendering
  - [ ] Add Content Security Policy headers (3.2)
  - [ ] Encode output based on context (HTML, JavaScript, URL)
- [ ] **Dependencies**: CSP headers (3.2)
- [ ] **Testing**: XSS attack simulation tests

---

## Priority 6: Database Security (If Using Database)

### 6.1 Database Security Setup
- [ ] **Files**: Database configuration files
- [ ] **Current Issue**: No database currently (using localStorage)
- [ ] **Tasks** (if/when implementing database):
  - [ ] Use parameterized queries or ORM (never string concatenation)
  - [ ] Implement least-privilege database user accounts
  - [ ] Filter database results by user ownership automatically
  - [ ] Enable encryption at rest if supported
  - [ ] Sanitize all data before database insertion
  - [ ] Use prepared statements for all queries
  - [ ] Implement database connection pooling with timeouts
- [ ] **Dependencies**: Database selection and setup
- [ ] **Testing**: SQL injection tests, data isolation tests

---

## Priority 7: Additional Security Measures

### 7.1 Password Requirements
- [ ] **File**: `app/auth/login/page.tsx` (and registration if added)
- [ ] **Current Issue**: No password validation
- [ ] **Tasks**:
  - [ ] Add password requirements:
    - Minimum 12 characters
    - At least one letter, one number, one symbol
    - No common passwords
  - [ ] Add password strength indicator
  - [ ] Add client-side validation
  - [ ] Add server-side validation
- [ ] **Dependencies**: Authentication system (1.1)
- [ ] **Testing**: Password validation tests, strength tests

### 7.2 Email Verification (If Adding Registration)
- [ ] **Files**: Create registration flow if needed
- [ ] **Current Issue**: N/A (no registration yet)
- [ ] **Tasks** (if adding registration):
  - [ ] Implement email verification for new accounts
  - [ ] Generate secure verification tokens
  - [ ] Send verification emails
  - [ ] Require verification before account activation
  - [ ] Add email verification status to user model
- [ ] **Dependencies**: Email service, registration flow
- [ ] **Testing**: Email verification flow tests

### 7.3 Security Monitoring & Logging
- [ ] **Files**: Create `lib/utils/logger.ts`, update API routes
- [ ] **Current Issue**: No structured security logging
- [ ] **Tasks**:
  - [ ] Implement security event logging
  - [ ] Log failed login attempts
  - [ ] Log rate limit violations
  - [ ] Log security threat detections
  - [ ] Log authentication failures
  - [ ] Never log sensitive data (passwords, tokens, API keys)
  - [ ] Use structured logging format
- [ ] **Dependencies**: Logging service (optional)
- [ ] **Testing**: Logging tests, sensitive data exclusion tests

### 7.4 Security.txt File ✅ COMPLETED
- [X] **File**: Create `public/.well-known/security.txt`
- [X] **Current Issue**: No security disclosure process
- [X] **Tasks**:
  - [X] Create security.txt file for responsible disclosure
  - [X] Add security contact email (placeholder)
  - [X] Add security policy URL (placeholder)
  - [X] Add acknowledgment section
- [X] **Dependencies**: None
- [ ] **Testing**: Verify file is accessible at `/.well-known/security.txt`
- **Files Created**: `public/.well-known/security.txt`
- **Note**: Update contact email and canonical URL before production deployment

---

## Priority 8: Code Quality & Testing

### 8.1 Security Testing
- [ ] **Files**: Create `__tests__/security/` directory
- [ ] **Current Issue**: No security-specific tests
- [ ] **Tasks**:
  - [ ] Write unit tests for security-critical functions
  - [ ] Add security test cases:
    - Password hashing tests
    - Session management tests
    - Rate limiting tests
    - Input validation tests
    - CSRF protection tests
    - XSS prevention tests
  - [ ] Add integration tests for auth flows
  - [ ] Add penetration testing checklist
- [ ] **Dependencies**: Testing framework setup
- [ ] **Testing**: Run security test suite

### 8.2 Security Code Review
- [ ] **Files**: All security-related files
- [ ] **Current Issue**: Need security-focused code review
- [ ] **Tasks**:
  - [ ] Review all authentication code
  - [ ] Review all API routes for security
  - [ ] Review input validation and sanitization
  - [ ] Review error handling
  - [ ] Comment security-critical code sections
  - [ ] Document security decisions
- [ ] **Dependencies**: None
- [ ] **Testing**: Manual security review

### 8.3 Dependency Security Audit
- [ ] **Files**: `package.json`, `package-lock.json`
- [ ] **Current Issue**: Need to audit dependencies
- [ ] **Tasks**:
  - [ ] Run `npm audit` to check for vulnerabilities
  - [ ] Update vulnerable dependencies
  - [ ] Set up automated dependency scanning (Dependabot/GitHub)
  - [ ] Review and approve dependency updates
  - [ ] Document security-critical dependencies
- [ ] **Dependencies**: None
- [ ] **Testing**: Run npm audit, verify fixes

---

## Implementation Order Recommendation

1. **Start with Priority 1** (Authentication & Authorization) - Foundation for everything else
2. **Then Priority 3** (Environment Variables) - Needed for secure configuration
3. **Then Priority 2** (API Security) - Protects endpoints
4. **Then Priority 4** (Input Validation) - Prevents attacks
5. **Then Priority 5** (CSRF & XSS) - Additional protections
6. **Then Priority 7** (Additional Measures) - Polish and monitoring
7. **Finally Priority 8** (Testing) - Verify everything works

---

## Notes

- **Current Security Features Already Implemented**:
  - ✅ Security scanning (`lib/security/scanner.ts`)
  - ✅ Security sanitization (`lib/security/sanitizer.ts`)
  - ✅ Basic input validation in API routes
  - ✅ TypeScript strict mode
  - ✅ Security threat detection for prompts

- **Estimated Timeline**: 
  - Priority 1-3: 2-3 days
  - Priority 4-5: 1-2 days
  - Priority 6-8: 2-3 days
  - **Total**: ~1-2 weeks for complete implementation

- **Testing Strategy**: 
  - Write tests as you implement each feature
  - Test security features in isolation
  - Integration tests for auth flows
  - Manual security testing checklist

---

## Questions to Resolve

- [ ] Will we use a database for user storage or keep localStorage for MVP?
- [ ] What authentication provider? (Supabase Auth, NextAuth.js, custom?)
- [ ] What rate limiting solution? (In-memory, Redis, external service?)
- [ ] What logging solution? (Console, external service, file-based?)
- [ ] Will we add user registration or keep single-user for now?

---

## Optional Features (Low Priority)

### API Keys Integration

**Status**: Optional - App works fully without API keys  
**Priority**: Low  
**Current State**: App uses algorithmic enhancement (works without external APIs)

**What API Keys Would Enable**:

1. **Real AI-Powered Analysis**
   - Use Claude/OpenAI APIs for deeper prompt insights
   - AI-generated intent classification
   - Context-aware prompt analysis
   - **Benefit**: More accurate and nuanced prompt understanding

2. **Accurate Token Counting**
   - Integrate tiktoken library for platform-specific tokenization
   - Replace current approximation (4 chars = 1 token)
   - Get exact token counts per platform
   - **Benefit**: Precise token usage tracking and cost calculation

3. **Real Cost Calculation**
   - Fetch actual pricing from OpenAI, Anthropic, etc. APIs
   - Replace mock pricing table
   - Real-time cost updates
   - **Benefit**: Accurate cost estimation for users

4. **Enhanced Suggestions**
   - AI-generated improvement recommendations
   - Context-aware enhancement suggestions
   - Platform-specific optimization tips
   - **Benefit**: Better prompt optimization guidance

**Implementation Notes**:
- Current enhancement is algorithmic and fully functional
- API keys are **optional** - app works great without them
- Can be added incrementally (start with token counting, then add AI analysis)
- Would require: API key management, error handling for API failures, rate limiting for external APIs

**When to Consider**:
- When you want AI-powered features
- When accurate token counting becomes important
- When users request real cost calculations
- When you want to differentiate from algorithmic-only tools

**Reference**: See this section whenever discussing API keys or feature additions

---

**Status Tracking**: Update checkboxes as tasks are completed. Move completed items to a "Completed" section at the bottom if desired.

