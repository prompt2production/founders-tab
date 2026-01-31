/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Upstash Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store - use Redis in production for multi-instance deployments
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier (usually IP address)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  // If no entry or window has passed, create new entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + options.windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      remaining: options.limit - 1,
      resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  // Check if over limit
  if (entry.count > options.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for real IP (behind proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback (won't work in production behind a proxy)
  return 'unknown'
}

// Preset configurations for common use cases
export const RATE_LIMITS = {
  // Strict limit for authentication endpoints
  auth: { limit: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  // Standard API limit
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  // Loose limit for read operations
  read: { limit: 300, windowMs: 60 * 1000 }, // 300 requests per minute
} as const
