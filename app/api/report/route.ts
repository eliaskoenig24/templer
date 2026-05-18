import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isSpam(category: string, description: string): boolean {
  if (!category || category.trim().length === 0) return true
  if (description && description.trim().length < 5) return true
  if (/^(.)\1+$/.test(description?.trim() || '')) return true // "aaaaaaa" etc.
  return false
}

async function saveReport(category: string, platform: string, description: string, knightId?: string, image?: string) {
  const spam = isSpam(category, description)

  let image_url: string | null = null
  if (image && !spam) {
    const buffer = Buffer.from(image, 'base64')
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filename, buffer, { contentType: 'image/jpeg' })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(filename)
      image_url = urlData.publicUrl
    }
  }

  return supabase.from('reports').insert([{
    category,
    platform,
    description: description || `Gemeldet via ${platform}`,
    image_url,
    knight_id: knightId || null,
    spam,
    anonymous: true,
    verified_count: 0,
    disputed_count: 0,
  }])
}

// GET: iOS Shortcut
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const platform = searchParams.get('platform') || 'iOS'
  const knightId = searchParams.get('knight_id') || undefined

  if (!category) return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
  if (isSpam(category, '')) return NextResponse.json({ error: 'Ungültige Meldung' }, { status: 400 })

  const { error } = await saveReport(category, platform, `Gemeldet via ${platform}`, knightId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: '⚔️ Meldung eingereicht' })
}

// POST: Web-Formular
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, image, platform = 'Web', description = '', knight_id } = body
    if (!category) return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
    const { error } = await saveReport(category, platform, description, knight_id, image)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
