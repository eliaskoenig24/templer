import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, image, platform = 'iOS', description = '' } = body

    if (!category) {
      return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
    }

    let image_url: string | null = null

    // Screenshot in Supabase Storage hochladen
    if (image) {
      const buffer = Buffer.from(image, 'base64')
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, buffer, { contentType: 'image/jpeg' })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('screenshots')
          .getPublicUrl(filename)
        image_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('reports').insert([{
      category,
      platform,
      description: description || `Gemeldet via ${platform}`,
      image_url,
      anonymous: true,
      verified_count: 0,
      disputed_count: 0,
    }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
