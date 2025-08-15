import { NextResponse } from 'next/server';

export async function middleware(request) {
 const token = request.cookies.get('token')?.value;
 const pathname = request.nextUrl.pathname;
 
 console.log('Middleware check:', { pathname, hasToken: !!token });
 
 // Admin routes protection
 if (pathname.startsWith('/admin')) {
   if (!token) {
     console.log('No token, redirecting to login');
     return NextResponse.redirect(new URL('/login', request.url));
   }
   
   try {
     // Dynamic import verifyToken to avoid edge runtime issues
     const { verifyToken } = await import('./lib/auth');
     const decoded = await verifyToken(token);
     console.log('Token decoded:', decoded);
     
     if (!decoded || decoded.role !== 'ADMIN') {
       console.log('Not admin or invalid token, redirecting to home');
       return NextResponse.redirect(new URL('/', request.url));
     }
     
     console.log('Admin access granted');
   } catch (error) {
     console.error('Middleware error:', error);
     return NextResponse.redirect(new URL('/login', request.url));
   }
 }
 
 // Redirect to home if already logged in and trying to access login
 if (pathname === '/login' && token) {
   try {
     const { verifyToken } = await import('./lib/auth');
     const decoded = await verifyToken(token);
     if (decoded) {
       return NextResponse.redirect(new URL('/', request.url));
     }
   } catch (error) {
     // Invalid token, allow access to login
     console.error('Login redirect error:', error);
   }
 }
 
 return NextResponse.next();
}

export const config = {
 matcher: ['/admin/:path*', '/login'],
 runtime: 'nodejs', // Force Node.js runtime instead of Edge
};