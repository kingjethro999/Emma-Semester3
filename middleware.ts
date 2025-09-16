import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const protectedPaths = [
    "/cart",
    "/profile",
  ]

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get("auth_token")?.value
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    if (pathname && pathname !== "/login") {
      loginUrl.searchParams.set("next", pathname + (search || ""))
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/cart",
    "/cart/:path*",
    "/profile/:path*",
  ],
}


