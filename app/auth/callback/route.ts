import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  // optional dest hash (e.g., #meu-palpite)
  const dest = requestUrl.searchParams.get('dest') || '#meu-palpite'
  try {
    const target = new URL('/', requestUrl.origin)
    // Include hash to jump to target section
    const hash = dest.startsWith('#') ? dest : `#${dest}`
    const finalUrl = new URL(`${target.toString()}${hash}`)
    return NextResponse.redirect(finalUrl, { status: 307 })
  } catch {
    return NextResponse.redirect(new URL('/', requestUrl.origin), { status: 307 })
  }
}
