import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (token?.role !== "admin" ) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}
 
export const config = {
  matcher: "/admin/:path*",
}