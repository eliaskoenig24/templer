/**
 * Bridge-Konsens-Algorithmus (Community Notes Stil).
 * Für Details zur Spieltheorie: backend/src/consensus/bridge-consensus.ts
 */

const THRESHOLD    = 0.40;
const LEARNING_RATE = 0.01;
const LAMBDA       = 0.03;
const ITERATIONS   = 200;

export interface ConsensusVote {
  userId:  string;
  noteId:  string;
  value:   1 | -1;
}

export interface ConsensusResult {
  intercept:  number;
  factor:     number;
  isVerified: boolean;
}

export function runConsensus(votes: ConsensusVote[], targetNoteId: string): ConsensusResult {
  const userBias   = new Map<string, number>();
  const noteBias   = new Map<string, number>();
  const userFactor = new Map<string, number>();
  const noteFactor = new Map<string, number>();

  const init = (key: string, map: Map<string, number>) => {
    if (!map.has(key)) map.set(key, (Math.random() - 0.5) * 0.1);
    return map.get(key)!;
  };

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const shuffled = [...votes].sort(() => Math.random() - 0.5);
    for (const { userId, noteId, value } of shuffled) {
      const bu = init(userId, userBias);
      const bn = init(noteId, noteBias);
      const fu = init(userId, userFactor);
      const fn = init(noteId, noteFactor);
      const err = value - (bu + bn + fu * fn);
      userBias.set(userId,   bu + LEARNING_RATE * (err - LAMBDA * bu));
      noteBias.set(noteId,   bn + LEARNING_RATE * (err - LAMBDA * bn));
      userFactor.set(userId, fu + LEARNING_RATE * (err * fn - LAMBDA * fu));
      noteFactor.set(noteId, fn + LEARNING_RATE * (err * fu - LAMBDA * fn));
    }
  }

  const intercept = noteBias.get(targetNoteId)  ?? 0;
  const factor    = noteFactor.get(targetNoteId) ?? 0;
  return { intercept, factor, isVerified: intercept >= THRESHOLD };
}
