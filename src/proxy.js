import { NextResponse } from "next/server";

// Routes that require authentication.
// Unauthenticated users will be redirected to /auth/login.
export function proxy(request) {
  // next-auth v4 stores the JWT in a cookie named:
  //   - "next-auth.session-token"     (HTTP / localhost)
  //   - "__Secure-next-auth.session-token" (HTTPS / production)
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    // Build the login URL with a callbackUrl so the user
    // returns to their intended destination after signing in.
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only run the proxy on these protected route patterns.
export const config = {
  matcher: [
    "/properties/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};
