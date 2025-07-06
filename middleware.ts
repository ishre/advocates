import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    const userRoles = token.roles || [];
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

    // Protect advocate routes - only advocates and admins can access
    if (path.startsWith("/dashboard/advocates")) {
      const hasAdvocateAccess = roles.some(role => 
        role === "advocate" || role === "admin"
      );
      
      if (!hasAdvocateAccess) {
        // Redirect based on user role
        if (roles.includes("client")) {
          return NextResponse.redirect(new URL("/dashboard/clients", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // Protect client routes - only clients can access
    if (path.startsWith("/dashboard/clients")) {
      const hasClientAccess = roles.includes("client");
      
      if (!hasClientAccess) {
        // Redirect based on user role
        if (roles.some(role => role === "advocate" || role === "admin")) {
          return NextResponse.redirect(new URL("/dashboard/advocates", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/cases/:path*",
    "/api/documents/:path*",
    "/api/clients/:path*",
    "/api/client/:path*",
  ],
}; 