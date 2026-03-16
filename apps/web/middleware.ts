import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/mfa', '/auth/callback'];

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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Auth guard — check session for protected routes
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isStaticOrApi = pathname.startsWith('/api') || pathname.startsWith('/_next');

  if (!isPublicRoute && !isStaticOrApi) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && pathname !== '/auth/callback') {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user && pathname !== '/mfa') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

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
