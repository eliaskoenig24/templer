-- ============================================================
-- AGORA: Cluster + Voting Schema
-- Ausführen in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Cluster-Tabelle
--    Ein Cluster = eine einzigartige Fake-News-Instanz.
--    Mehrere Screenshots derselben Meldung → ein Cluster.
CREATE TABLE IF NOT EXISTS clusters (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phash          TEXT        NOT NULL,         -- 64-Bit perceptual hash (hex)
  report_count   INTEGER     NOT NULL DEFAULT 1,
  is_verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  consensus_score FLOAT,                        -- bias_n aus Matrix-Faktorisierung
  vote_count     INTEGER     NOT NULL DEFAULT 0,
  ipfs_cid       TEXT,                          -- nach dezentralem Export gesetzt
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. cluster_id zu bestehenden Reports hinzufügen
ALTER TABLE reports ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES clusters(id);

-- 3. Votes-Tabelle (für Bridge-Konsens-Algorithmus)
--    Jeder Vote gehört einem anonymen Nutzer-Token und einem Cluster.
CREATE TABLE IF NOT EXISTS votes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT        NOT NULL,            -- SHA-256 des Geräte-Public-Keys
  cluster_id   UUID        NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  value        SMALLINT    NOT NULL CHECK (value IN (1, -1)),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (anonymous_id, cluster_id)             -- Ein Vote pro Nutzer pro Cluster
);

-- 4. Nullifier-Tabelle (Anti-Spam / Anti-Doppelmeldung)
--    Verhindert, dass dasselbe Gerät dieselbe Meldung doppelt einreicht.
CREATE TABLE IF NOT EXISTS nullifiers (
  nullifier    TEXT        PRIMARY KEY,
  anonymous_id TEXT        NOT NULL,
  used_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_clusters_created    ON clusters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clusters_verified   ON clusters(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_votes_cluster       ON votes(cluster_id);
CREATE INDEX IF NOT EXISTS idx_reports_cluster     ON reports(cluster_id);

-- 6. RLS: Clusters sind öffentlich lesbar, aber nur via Service-Key schreibbar
ALTER TABLE clusters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE nullifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clusters_read"    ON clusters   FOR SELECT USING (TRUE);
CREATE POLICY "votes_read"       ON votes      FOR SELECT USING (TRUE);
-- Schreiben nur via service_role (API Route mit SUPABASE_SERVICE_KEY):
-- INSERT/UPDATE werden durch die API Route mit elevated Rechten durchgeführt.
