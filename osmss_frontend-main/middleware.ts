import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/"

  // For the preview environment, we'll consider all users authenticated
  // In a real app, you would check for the authentication cookie
  const isAuthenticated = true

  // If the path requires authentication and the user is not authenticated,
  // redirect to the login page
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the user is authenticated and trying to access the login page,
  // redirect to the dashboard
  if (isPublicPath && isAuthenticated && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

