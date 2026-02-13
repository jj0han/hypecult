import { getSession } from 'next-auth/react'
import { NextResponse, NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    // return NextResponse.redirect(new URL('/', request.url))
  }
}
 
export const config = {
  matcher: "/account/:path*",
}