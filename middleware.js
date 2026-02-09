import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/portal')) {
    const auth = req.cookies.get('oz_auth')?.value === 'true'
    if (!auth) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
