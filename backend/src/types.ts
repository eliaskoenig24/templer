// Gemeinsame Typen für das gesamte Agora-Backend

export interface RawReport {
  id: string;
  imageBuffer: Buffer;
  platform: string;
  category: string;
  description: string;
  contentUrl?: string;
  reporterCountry?: string;
  // Kryptografischer Beweis, dass hinter dieser Meldung ein echter Mensch steckt
  // (ZK-Proof, Apple Secure Enclave Signatur, o.ä.)
  identityProof: IdentityProof;
  createdAt: Date;
}

export interface IdentityProof {
  type: "zk_semaphore" | "secure_enclave" | "world_id" | "dev_placeholder";
  // Der Nullifier: ein deterministischer Hash, der pro Gerät+Aktion eindeutig ist,
  // aber NICHT zurückverfolgbar ist (kein Link zu echter Identität).
  // Gleicher Nullifier = selbe Person meldet doppelt → abweisen.
  nullifier: string;
  proof: string; // Base64-kodierter ZK-Proof oder Signatur
}

export interface Cluster {
  id: string;
  phash: bigint;       // 64-bit perceptual hash des Referenz-Screenshots
  reportIds: string[]; // Alle Meldungen in diesem Cluster
  createdAt: Date;
  lastUpdated: Date;
  // Verifizierungsstatus nach Konsens-Algorithmus
  consensusScore: number | null; // null = noch nicht genug Votes
  isVerified: boolean;
  voteCount: number;
}

export interface Vote {
  userId: string;   // Anonymer Identitäts-Token (aus IdentityProof abgeleitet)
  noteId: string;   // = clusterId
  value: 1 | -1;   // 1 = bestätigt (helpful), -1 = bestreite (not helpful)
  createdAt: Date;
}

export interface NoteScore {
  noteId: string;
  // Der Intercept (bias_n) ist der entscheidende Wert:
  // Er misst, wie stark ALLE Nutzer – quer durch alle Lager – zustimmen.
  // Nur wenn dieser Wert über dem Schwellwert liegt, wird die Meldung verifiziert.
  intercept: number;
  // Der Faktor beschreibt die "politische Ladung" der Meldung.
  // Ein hoher |factor| bedeutet: nur ein Lager findet sie hilfreich.
  factor: number;
  isVerified: boolean;
}
