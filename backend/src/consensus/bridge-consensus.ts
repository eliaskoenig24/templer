/**
 * BRIDGE CONSENSUS ALGORITHM
 * ===========================
 * Basiert auf dem Community Notes Algorithmus von X (ehemals Twitter).
 * Originalpaper: https://github.com/twitter/communitynotes
 *
 * KERNIDEE — "Bridges, not Dividers":
 * Eine Meldung wird nur dann als "verifiziert" markiert, wenn Menschen
 * mit UNTERSCHIEDLICHEN Weltanschauungen übereinstimmen.
 * Das verhindert, dass eine organisierte politische Gruppe (ein "Lager")
 * alleine bestimmt, was wahr ist.
 *
 * MATHEMATISCHES MODELL:
 * Wir haben eine Matrix V (Nutzer × Meldungen) mit Votes (-1, 0, +1).
 * Diese wird durch Low-Rank-Faktorisierung approximiert:
 *
 *   V[u,n] ≈ bias_u + bias_n + factor_u · factor_n
 *
 *   bias_u:   Wie "hilfreich" findet Nutzer u im Allgemeinen eine Meldung?
 *             (manche stimmen generell zu, manche sind kritischer)
 *
 *   bias_n:   Wie "hilfreich" findet die Community die Meldung n,
 *             UNABHÄNGIG von politischer Ausrichtung?
 *             → DAS ist unser Konsens-Score. Wenn bias_n > Schwellwert:
 *               Menschen aus ALLEN Lagern stimmen zu. → VERIFIZIERT.
 *
 *   factor_u · factor_n: Die "polarisierende Komponente".
 *             Wenn factor_u und factor_n das gleiche Vorzeichen haben,
 *             stimmt Nutzer u nur zu, weil er im gleichen "Lager" ist.
 *             Diese Komponente wird beim Entscheid IGNORIERT.
 *             Nur bias_n zählt.
 *
 * SPIELTHEORIE:
 * Ein Botnetz aus dem "rechten Lager" kann alle die gleichen factor_u haben.
 * Ihr kollektiver Vote hebt bias_n kaum, aber factor_n sehr stark.
 * Dadurch bleibt bias_n unter dem Schwellwert → keine Verifikation.
 * Die Manipulation scheitert, weil sie erkennbar einseitig ist.
 */

import type { Vote, NoteScore } from "../types.js";

const THRESHOLD = 0.40;   // Community Notes Standard: ~0.40
const LEARNING_RATE = 0.01;
const LAMBDA = 0.03;      // L2-Regularisierung (verhindert Overfitting)
const ITERATIONS = 200;   // Konvergiert typisch nach ~100 Iterationen

export class BridgeConsensus {
  // Modell-Parameter (gelernt durch Training)
  private userBias = new Map<string, number>();
  private noteBias = new Map<string, number>();
  private userFactor = new Map<string, number>();
  private noteFactor = new Map<string, number>();

  // Kleines zufälliges Rauschen als Initialisierung (verhindert Symmetrie-Deadlock)
  private init(key: string, map: Map<string, number>): number {
    if (!map.has(key)) {
      map.set(key, (Math.random() - 0.5) * 0.1);
    }
    return map.get(key)!;
  }

  /**
   * Trainiert das Modell auf allen bekannten Votes.
   * Sollte bei jedem neuen Vote-Batch neu aufgerufen werden.
   * Für Produktion: inkrementelles Update oder regelmäßiger Batch-Job.
   */
  train(votes: Vote[]): void {
    if (votes.length === 0) return;

    for (let iter = 0; iter < ITERATIONS; iter++) {
      // Stochastic Gradient Descent: Votes in zufälliger Reihenfolge
      const shuffled = [...votes].sort(() => Math.random() - 0.5);

      for (const { userId, noteId, value } of shuffled) {
        const bu = this.init(userId, this.userBias);
        const bn = this.init(noteId, this.noteBias);
        const fu = this.init(userId, this.userFactor);
        const fn = this.init(noteId, this.noteFactor);

        // Vorhersage und Fehler
        const prediction = bu + bn + fu * fn;
        const error = value - prediction;

        // SGD-Update mit L2-Regularisierung
        // Die Regularisierung zieht Parameter in Richtung 0 → verhindert Extreme
        this.userBias.set(userId,  bu + LEARNING_RATE * (error - LAMBDA * bu));
        this.noteBias.set(noteId,  bn + LEARNING_RATE * (error - LAMBDA * bn));
        this.userFactor.set(userId, fu + LEARNING_RATE * (error * fn - LAMBDA * fu));
        this.noteFactor.set(noteId, fn + LEARNING_RATE * (error * fu - LAMBDA * fn));
      }
    }
  }

  /**
   * Berechnet den finalen Konsens-Score für eine oder mehrere Meldungen.
   * Nur bias_n (intercept) entscheidet über Verifikation.
   */
  score(noteIds: string[]): NoteScore[] {
    return noteIds.map((noteId) => {
      const intercept = this.noteBias.get(noteId) ?? 0;
      const factor    = this.noteFactor.get(noteId) ?? 0;

      return {
        noteId,
        intercept,
        factor,
        // Eine Meldung ist verifiziert, wenn der lagerübergreifende Konsens
        // den Schwellwert überschreitet – unabhängig von der polarisierenden Komponente.
        isVerified: intercept >= THRESHOLD,
      };
    });
  }

  /**
   * Exportiert das trainierte Modell (für Persistenz in DB oder Datei).
   */
  export(): {
    userBias: [string, number][];
    noteBias: [string, number][];
    userFactor: [string, number][];
    noteFactor: [string, number][];
  } {
    return {
      userBias:   [...this.userBias.entries()],
      noteBias:   [...this.noteBias.entries()],
      userFactor: [...this.userFactor.entries()],
      noteFactor: [...this.noteFactor.entries()],
    };
  }

  /**
   * Lädt ein gespeichertes Modell (z.B. beim Server-Start).
   */
  import(data: ReturnType<BridgeConsensus["export"]>): void {
    this.userBias   = new Map(data.userBias);
    this.noteBias   = new Map(data.noteBias);
    this.userFactor = new Map(data.userFactor);
    this.noteFactor = new Map(data.noteFactor);
  }
}

// ---------------------------------------------------------------------------
// Demo: Zeigt wie der Algorithmus politische Manipulation erkennt
// ---------------------------------------------------------------------------
export function runDemo(): void {
  const consensus = new BridgeConsensus();

  // Simuliertes Szenario:
  // - Meldung A: Echter Fake-News-Fund — Menschen aller Lager bestätigen
  // - Meldung B: Politisch motivierte Meldung — nur ein Lager bestätigt

  const votes: Vote[] = [
    // Meldung A: broad agreement (Nutzer aus verschiedenen "Lagern")
    { userId: "left_1",   noteId: "A", value:  1, createdAt: new Date() },
    { userId: "left_2",   noteId: "A", value:  1, createdAt: new Date() },
    { userId: "center_1", noteId: "A", value:  1, createdAt: new Date() },
    { userId: "right_1",  noteId: "A", value:  1, createdAt: new Date() },
    { userId: "right_2",  noteId: "A", value:  1, createdAt: new Date() },

    // Meldung B: nur ein Lager stimmt zu
    { userId: "left_1",   noteId: "B", value:  1, createdAt: new Date() },
    { userId: "left_2",   noteId: "B", value:  1, createdAt: new Date() },
    { userId: "left_3",   noteId: "B", value:  1, createdAt: new Date() },
    { userId: "right_1",  noteId: "B", value: -1, createdAt: new Date() },
    { userId: "right_2",  noteId: "B", value: -1, createdAt: new Date() },
    { userId: "center_1", noteId: "B", value: -1, createdAt: new Date() },

    // Lager-Konsistenz etablieren (damit der Algorithmus Lager "lernt"):
    // Links und Rechts bewerten andere Themen entgegengesetzt
    { userId: "left_1",  noteId: "topic_1", value:  1, createdAt: new Date() },
    { userId: "right_1", noteId: "topic_1", value: -1, createdAt: new Date() },
    { userId: "left_2",  noteId: "topic_2", value:  1, createdAt: new Date() },
    { userId: "right_2", noteId: "topic_2", value: -1, createdAt: new Date() },
  ];

  consensus.train(votes);
  const scores = consensus.score(["A", "B"]);

  console.log("\n=== BRIDGE CONSENSUS DEMO ===");
  for (const s of scores) {
    console.log(`Meldung ${s.noteId}:`);
    console.log(`  Intercept (lagerübergreifend): ${s.intercept.toFixed(3)}`);
    console.log(`  Factor    (polarisierend):      ${s.factor.toFixed(3)}`);
    console.log(`  VERIFIZIERT: ${s.isVerified ? "✓ JA" : "✗ NEIN"}`);
    console.log();
  }
  // Erwartetes Ergebnis:
  // Meldung A: intercept ≈ 0.4+, isVerified = true
  // Meldung B: intercept < 0.4,  isVerified = false (obwohl 3 Votes positiv)
}
