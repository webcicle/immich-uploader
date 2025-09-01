interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimit = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimit.get(identifier);
  
  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimit.delete(identifier);
  }
  
  const currentEntry = rateLimit.get(identifier);
  
  if (!currentEntry) {
    // First request
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (currentEntry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime
    };
  }
  
  // Increment counter
  currentEntry.count += 1;
  rateLimit.set(identifier, currentEntry);
  
  return {
    allowed: true,
    remaining: maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimit.entries()) {
    if (now > entry.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes