/**
 * KRYPTOGRAFISCHE ANONYMITÄT — OHNE ACCOUNTS
 * ============================================
 * Problem: Wir wollen 1 Meldung pro echter Person, aber KEINE Registrierung.
 *
 * LÖSUNG: Anonyme eindeutige Identitäten via kryptografischen Commitments.
 *
 * OPTIONEN (nach Aufwand sortiert):
 *
 * 1. SEMAPHORE (Zero-Knowledge) — beste Anonymität
 *    Nutzer erzeugt Schlüsselpaar lokal. Registriert einen Commitment
 *    (Hash des öffentlichen Schlüssels) in einer Merkle-Tree-Gruppe.
 *    Für jede Aktion (Meldung, Vote) generiert er einen ZK-Proof:
 *    "Ich bin in der Gruppe, und dieser Nullifier ist einmalig für diese Aktion."
 *    Server kann Doppelmeldungen erkennen (gleicher Nullifier), aber NICHT
 *    welche Person dahintersteckt.
 *    → npm install @semaphore-protocol/core
 *
 * 2. WORLD ID (Worldcoin) — biometrisch verifiziert
 *    Iris-Scan ↔ Einmaliger ZK-Proof.
 *    Extremste Form: beweist echten Menschen, absolut bot-resistent.
 *    Nachteil: erfordert Iris-Scan, viele lehnen das ab.
 *    → developer.worldcoin.org
 *
 * 3. APPLE SECURE ENCLAVE — pragmatisch für iOS
 *    Das Gerät signiert eine Nachricht mit einem Schlüssel, der im
 *    Secure Enclave gespeichert ist und das Gerät nie verlässt.
 *    Der Server sieht: "Dieses spezifische Gerät hat gemeldet."
 *    Aber: 1 Person mit 2 Geräten → 2 Identitäten. Kein echter Sybil-Schutz.
 *    Gut genug für Phase 1.
 *
 * FÜR AGORA Phase 1: Apple Secure Enclave (bereits im iOS Shortcut nutzbar)
 * FÜR AGORA Phase 2: Semaphore ZK-Proofs (wenn Sybil-Resistenz kritisch wird)
 */

export interface VerifiedIdentity {
  // Pseudonymer, nicht rückverfolgbarer Identitäts-Token
  // Wird aus dem Proof abgeleitet und ist pro Gerät/Person stabil.
  anonymousId: string;

  // Einmaliger Hash für diese spezifische Aktion (verhindert Replay-Angriffe)
  // Gleicher Nullifier in DB = Doppelmeldung → abweisen
  nullifier: string;

  proofType: "secure_enclave" | "semaphore" | "world_id" | "dev_placeholder";
  isValid: boolean;
}

// ---------------------------------------------------------------------------
// Apple Secure Enclave (iOS) — Phase 1
// ---------------------------------------------------------------------------

/**
 * Verifiziert eine Geräte-Signatur von Apple Secure Enclave.
 *
 * iOS-Seite (Swift im Shortcut oder in einer nativen App):
 *   let key = try SecureEnclave.P256.Signing.PrivateKey(...)
 *   let signature = try key.signature(for: Data(action.utf8))
 *   // → Base64 der Signatur + Base64 des öffentlichen Schlüssels senden
 *
 * Server-Seite (hier):
 */
export async function verifySecureEnclaveSignature(params: {
  action: string;          // z.B. "report:2026-05-18:cluster_id_xyz"
  publicKeyBase64: string; // P-256 Public Key
  signatureBase64: string; // ECDSA-Signatur
}): Promise<VerifiedIdentity> {
  const { action, publicKeyBase64, signatureBase64 } = params;

  // Web Crypto API (in Node.js 18+, Bun, Vercel Edge Functions verfügbar)
  const publicKeyBytes  = Buffer.from(publicKeyBase64, "base64");
  const signatureBytes  = Buffer.from(signatureBase64, "base64");
  const actionBytes     = new TextEncoder().encode(action);

  // Deterministischer anonymer Token = SHA-256 des öffentlichen Schlüssels
  // Stabil pro Gerät, aber rückwärts nicht zu einer Person rückverfolgbar
  const hashBuffer  = await crypto.subtle.digest("SHA-256", publicKeyBytes);
  const anonymousId = Buffer.from(hashBuffer).toString("hex");

  // Nullifier = SHA-256(anonymousId + action) — einmalig pro Gerät+Aktion
  const nullifierInput = new TextEncoder().encode(anonymousId + action);
  const nullifierHash  = await crypto.subtle.digest("SHA-256", nullifierInput);
  const nullifier      = Buffer.from(nullifierHash).toString("hex");

  // ECDSA P-256 Signatur verifizieren
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    signatureBytes,
    actionBytes
  );

  return { anonymousId, nullifier, proofType: "secure_enclave", isValid };
}

// ---------------------------------------------------------------------------
// Semaphore ZKP — Phase 2 (Skizze)
// ---------------------------------------------------------------------------
// import { Group, Identity, generateProof, verifyProof } from "@semaphore-protocol/core";
//
// export async function verifySemaphoreProof(proof: SemaphoreProof): Promise<VerifiedIdentity> {
//   const isValid = await verifyProof(proof, TREE_DEPTH);
//   return {
//     anonymousId: proof.commitment,   // Öffentliches Commitment (kein Link zur Person)
//     nullifier:   proof.nullifier,    // Einmalig pro Aktion — Doppelmeldungen erkennbar
//     proofType:   "semaphore",
//     isValid,
//   };
// }

// ---------------------------------------------------------------------------
// Doppelmeldungs-Check (unabhängig vom Proof-Typ)
// ---------------------------------------------------------------------------
export async function isNullifierUsed(
  nullifier: string,
  supabase: { from: (t: string) => unknown }
): Promise<boolean> {
  const db = supabase.from("nullifiers") as {
    select: (f: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: unknown }> } }
  };
  const { data } = await db.select("nullifier").eq("nullifier", nullifier).single();
  return data !== null;
}
