import { NextResponse } from 'next/server';

export default function middleware(request) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Define public paths
  const publicPaths = ['/', '/login', '/signup'];
  
  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path
  );
  
  // Redirect logic
  if (!token && !isPublicPath) {
    // If not authenticated and trying to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Don't redirect from public paths if token exists, except for home page
  if (token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Only run middleware on specific routes
export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard', '/profile']
}; 