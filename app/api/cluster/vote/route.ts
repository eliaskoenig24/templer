/**
 * POST /api/cluster/vote
 *
 * Nimmt einen Nutzer-Vote für einen Cluster entgegen,
 * führt den Bridge-Konsens-Algorithmus aus und markiert
 * den Cluster als verifiziert wenn der Schwellwert überschritten wird.
 *
 * Body: { clusterId: string, value: 1 | -1, anonymousId: string }
 *
 * anonymousId ist der SHA-256 des Geräte-Public-Keys (kein Login nötig).
 * Für Phase 1 kann der Client diesen lokal generieren und cachen.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runConsensus, type ConsensusVote } from '@/lib/consensus'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clusterId, value, anonymousId } = body as {
      clusterId:   string
      value:       1 | -1
      anonymousId: string
    }

    // Validierung
    if (!clusterId || !anonymousId)
      return NextResponse.json({ error: 'clusterId und anonymousId erforderlich' }, { status: 400 })
    if (value !== 1 && value !== -1)
      return NextResponse.json({ error: 'value muss 1 oder -1 sein' }, { status: 400 })

    // Doppelvote-Check
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('anonymous_id', anonymousId)
      .eq('cluster_id', clusterId)
      .single()

    if (existing)
      return NextResponse.json({ error: 'Bereits abgestimmt' }, { status: 409 })

    // Vote speichern
    const { error: insertError } = await supabase
      .from('votes')
      .insert({ anonymous_id: anonymousId, cluster_id: clusterId, value })

    if (insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })

    // Alle Votes für diesen Cluster laden
    const { data: allVotes } = await supabase
      .from('votes')
      .select('anonymous_id, value')
      .eq('cluster_id', clusterId)

    if (!allVotes || allVotes.length === 0)
      return NextResponse.json({ success: true, message: 'Vote gespeichert (zu wenige Votes für Konsens)' })

    // Bridge-Konsens-Algorithmus ausführen
    // Mindest-Votes: 5 (vorher kein Sinn, das Modell zu trainieren)
    const MIN_VOTES = 5
    let result = null

    if (allVotes.length >= MIN_VOTES) {
      const votes: ConsensusVote[] = allVotes.map(v => ({
        userId: v.anonymous_id,
        noteId: clusterId,
        value:  v.value as 1 | -1,
      }))

      // Kontextualisierung: Wenn Nutzer andere Cluster bewertet haben,
      // lernt das Modell ihre "Lager-Zugehörigkeit" besser.
      // Für Phase 1: Nur die Votes dieses Clusters verwenden.
      result = runConsensus(votes, clusterId)

      // Cluster-Status in Supabase aktualisieren
      await supabase
        .from('clusters')
        .update({
          consensus_score: result.intercept,
          is_verified:     result.isVerified,
          vote_count:      allVotes.length,
          last_updated:    new Date().toISOString(),
        })
        .eq('id', clusterId)

      // Wenn verifiziert: alle Reports in diesem Cluster markieren
      if (result.isVerified) {
        await supabase
          .from('reports')
          .update({ verified_count: allVotes.filter(v => v.value === 1).length })
          .eq('cluster_id', clusterId)
      }
    } else {
      // Noch nicht genug Votes — nur Zähler aktualisieren
      await supabase
        .from('clusters')
        .update({ vote_count: allVotes.length, last_updated: new Date().toISOString() })
        .eq('id', clusterId)
    }

    return NextResponse.json({
      success:     true,
      voteCount:   allVotes.length,
      consensus:   result,
      // Hinweis für den Client, wie viele Votes noch fehlen
      votesNeeded: Math.max(0, MIN_VOTES - allVotes.length),
    })

  } catch (e) {
    console.error('/api/cluster/vote:', e)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
