/**
 * CLUSTER-MANAGEMENT
 * ==================
 * Wenn eine neue Meldung eingeht:
 * 1. pHash des Screenshots berechnen
 * 2. In Qdrant nach ähnlichen Hashes suchen (Vektordatenbank)
 * 3. Wenn ähnlich (Hamming ≤ 10): Meldung in existierenden Cluster einordnen
 * 4. Wenn neu: neuen Cluster anlegen
 *
 * WARUM QDRANT statt SQL LIKE-Suche?
 * Qdrant speichert pHashes als Vektoren und findet ähnliche in O(log n).
 * Mit SQL müsste man alle Hashes per Hamming-Distanz prüfen → O(n).
 * Bei 1 Million Meldungen wäre das unlösbar langsam.
 *
 * QDRANT-SETUP: docker run -p 6333:6333 qdrant/qdrant
 * SDK: npm install @qdrant/js-client-rest
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { createClient } from "@supabase/supabase-js";
import { hashToHex, hexToHash, isSameContent, computePhash } from "./phash.js";
import type { Cluster, RawReport } from "../types.js";

const COLLECTION = "agora_clusters";
const VECTOR_DIM  = 64; // pHash = 64 Bits = 64-dimensionaler Binärvektor

// ---------------------------------------------------------------------------
// Hilfsfunktionen: pHash ↔ Qdrant-Vektor-Format
// ---------------------------------------------------------------------------

/**
 * Konvertiert einen 64-Bit pHash in einen 64-dimensionalen Float-Vektor.
 * Qdrant erwartet Float32-Vektoren; wir kodieren jeden Bit als 0.0 oder 1.0.
 * Kosinus-Similarität auf 0/1-Vektoren entspricht ungefähr der Hamming-Ähnlichkeit.
 */
function hashToVector(hash: bigint): number[] {
  return Array.from({ length: 64 }, (_, i) =>
    Number((hash >> BigInt(i)) & 1n)
  );
}

function vectorToHash(vec: number[]): bigint {
  return vec.reduce(
    (hash, bit, i) => (bit > 0.5 ? hash | (1n << BigInt(i)) : hash),
    0n
  );
}

// ---------------------------------------------------------------------------
// ClusterManager
// ---------------------------------------------------------------------------

export class ClusterManager {
  private qdrant: QdrantClient;
  private supabase: ReturnType<typeof createClient>;

  constructor(qdrantUrl: string, supabaseUrl: string, supabaseKey: string) {
    this.qdrant   = new QdrantClient({ url: qdrantUrl });
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Initialisiert die Qdrant-Collection (einmalig beim Setup aufrufen).
   */
  async init(): Promise<void> {
    const collections = await this.qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION);

    if (!exists) {
      await this.qdrant.createCollection(COLLECTION, {
        vectors: {
          size:     VECTOR_DIM,
          distance: "Cosine", // Am besten für Binär-Vektoren (≈ Hamming)
        },
      });
      console.log(`Qdrant-Collection '${COLLECTION}' erstellt.`);
    }
  }

  /**
   * Verarbeitet eine neue Meldung:
   * - Berechnet pHash
   * - Sucht ähnliche Cluster
   * - Fügt Meldung in passenden Cluster ein (oder erstellt neuen)
   *
   * @returns Cluster-ID, dem die Meldung zugeordnet wurde
   */
  async ingest(report: RawReport, grayPixels: number[][]): Promise<string> {
    const hash = computePhash(grayPixels);
    const vector = hashToVector(hash);

    // 1. Suche nach ähnlichen Clustern in Qdrant (Top-5)
    const searchResult = await this.qdrant.search(COLLECTION, {
      vector,
      limit: 5,
      with_payload: true,
    });

    // 2. Prüfe ob ein Treffer wirklich ähnlich genug ist (Hamming ≤ 10)
    let targetClusterId: string | null = null;
    for (const hit of searchResult) {
      const candidateHash = hexToHash(hit.payload!.phash as string);
      if (isSameContent(hash, candidateHash)) {
        targetClusterId = hit.payload!.clusterId as string;
        break;
      }
    }

    if (targetClusterId) {
      // 3a. Existierender Cluster: Meldung hinzufügen
      await this.supabase
        .from("clusters")
        .update({ last_updated: new Date().toISOString() })
        .eq("id", targetClusterId);

      await this.supabase
        .from("reports")
        .update({ cluster_id: targetClusterId })
        .eq("id", report.id);

      console.log(`Meldung ${report.id} → Cluster ${targetClusterId} (bekannter Inhalt)`);
      return targetClusterId;

    } else {
      // 3b. Neuer Cluster: Anlegen + in Qdrant indexieren
      const { data: cluster } = await this.supabase
        .from("clusters")
        .insert({
          phash:        hashToHex(hash),
          report_ids:   [report.id],
          created_at:   new Date().toISOString(),
          last_updated: new Date().toISOString(),
          is_verified:  false,
          vote_count:   0,
        })
        .select()
        .single();

      if (!cluster) throw new Error("Fehler beim Erstellen des Clusters");

      // In Qdrant indexieren für zukünftige Ähnlichkeitssuchen
      await this.qdrant.upsert(COLLECTION, {
        points: [{
          id:      cluster.id,           // UUID als Qdrant-Punkt-ID
          vector,
          payload: {
            clusterId: cluster.id,
            phash:     hashToHex(hash),
          },
        }],
      });

      await this.supabase
        .from("reports")
        .update({ cluster_id: cluster.id })
        .eq("id", report.id);

      console.log(`Meldung ${report.id} → neuer Cluster ${cluster.id}`);
      return cluster.id;
    }
  }
}
