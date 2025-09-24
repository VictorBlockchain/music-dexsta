import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
      }
      
      if (data.user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${origin}?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}?error=${encodeURIComponent('No authentication code provided.')}`)
}
