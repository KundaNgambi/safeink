import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting state (in production, use Upstash Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/auth': { limit: 5, window: 60000 },
  '/api/notes': { limit: 120, window: 60000 },
  '/api/categories': { limit: 60, window: 60000 },
  '/api/search': { limit: 30, window: 60000 },
  '/api/files': { limit: 10, window: 60000 },
  default: { limit: 1000, window: 60000 },
};

function getRateLimit(pathname: string) {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (prefix !== 'default' && pathname.startsWith(prefix)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${request.nextUrl.pathname}`;
    const { limit, window } = getRateLimit(request.nextUrl.pathname);
    const now = Date.now();

    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + window });
    } else {
      entry.count++;
      if (entry.count > limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
              'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            },
          }
        );
      }
    }

    response.headers.set('X-RateLimit-Limit', limit.toString());
    const remaining = Math.max(0, limit - (rateLimitMap.get(key)?.count || 0));
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
