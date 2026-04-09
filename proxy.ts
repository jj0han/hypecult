import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from './server/db/generated/prisma/enums'
import { getToken } from 'next-auth/jwt'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  if (token?.role !== UserRole.admin ) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}
 
export const config = {
  matcher: "/admin/:path*",
}