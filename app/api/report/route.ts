import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashFromBuffer, hashToHex, hexToHash, isSameContent } from '@/lib/phash'

// Service-Key für Schreibzugriff auf clusters/nullifiers (RLS-geschützt)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isSpam(category: string, description: string): boolean {
  if (!category || category.trim().length === 0) return true
  if (description && description.trim().length < 5) return true
  if (/^(.)\1+$/.test(description?.trim() || '')) return true
  return false
}

/**
 * Sucht einen passenden Cluster für einen pHash oder erstellt einen neuen.
 * Lädt die 200 zuletzt erstellten Cluster und berechnet Hamming-Distanzen in JS.
 * Für Phase 1 (< 50k Cluster) ausreichend schnell.
 */
async function findOrCreateCluster(hash: bigint): Promise<string> {
  const { data: recent } = await supabase
    .from('clusters')
    .select('id, phash')
    .order('created_at', { ascending: false })
    .limit(200)

  if (recent) {
    for (const row of recent) {
      if (isSameContent(hash, hexToHash(row.phash))) {
        // Vorhandenen Cluster aktualisieren
        await supabase
          .from('clusters')
          .update({ report_count: supabase.rpc('increment', { row_id: row.id }), last_updated: new Date().toISOString() })
          .eq('id', row.id)
        return row.id
      }
    }
  }

  // Neuen Cluster anlegen
  const { data: cluster, error } = await supabase
    .from('clusters')
    .insert({ phash: hashToHex(hash), report_count: 1 })
    .select('id')
    .single()

  if (error || !cluster) throw new Error('Cluster konnte nicht erstellt werden: ' + error?.message)
  return cluster.id
}

async function saveReport(
  category: string,
  platform: string,
  description: string,
  knightId?: string,
  imageBase64?: string,
) {
  const spam = isSpam(category, description)

  let image_url: string | null = null
  let cluster_id: string | null = null

  if (imageBase64 && !spam) {
    const buffer = Buffer.from(imageBase64, 'base64')

    // 1. Bild in Supabase Storage hochladen
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filename, buffer, { contentType: 'image/jpeg' })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(filename)
      image_url = urlData.publicUrl

      // 2. pHash berechnen + Cluster zuweisen
      try {
        const hash = await hashFromBuffer(buffer)
        cluster_id = await findOrCreateCluster(hash)
      } catch (e) {
        // pHash-Fehler ist nicht kritisch — Meldung trotzdem speichern
        console.error('pHash/Cluster Fehler:', e)
      }
    }
  }

  const { data, error } = await supabase.from('reports').insert([{
    category,
    platform,
    description: description || `Gemeldet via ${platform}`,
    image_url,
    knight_id: knightId || null,
    cluster_id,
    spam,
    anonymous: true,
    verified_count: 0,
    disputed_count: 0,
  }]).select('id').single()

  return { data, error }
}

// GET: iOS Shortcut (ohne Bild)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const platform = searchParams.get('platform') || 'iOS'
  const knightId = searchParams.get('knight_id') || undefined
  const image    = searchParams.get('image') || undefined

  if (!category) return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
  if (isSpam(category, '')) return NextResponse.json({ error: 'Ungültige Meldung' }, { status: 400 })

  const { data, error } = await saveReport(category, platform, `Gemeldet via ${platform}`, knightId, image)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: '⚔️ Meldung eingereicht', id: data?.id })
}

// POST: Web-Formular + iOS Shortcut mit Base64-Bild
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, image, platform = 'Web', description = '', knight_id } = body
    if (!category) return NextResponse.json({ error: 'Kategorie fehlt' }, { status: 400 })
    const { data, error } = await saveReport(category, platform, description, knight_id, image)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, id: data?.id })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
