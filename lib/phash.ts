/**
 * pHash-Utility für Next.js API Routes.
 * Abhängigkeit: sharp (für 32×32 Graustufen-Resize)
 */

import sharp from "sharp";

const HASH_SIZE = 8;
const DCT_SIZE  = 32;

function dct2d(pixels: number[][]): number[][] {
  const N = pixels.length;
  const out: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          sum +=
            pixels[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      out[u][v] = (2 / N) * cu * cv * sum;
    }
  }
  return out;
}

/** Berechnet pHash aus einem rohen 32×32 Graustufen-Pixel-Array. */
export function computePhash(grayPixels: number[][]): bigint {
  const dct = dct2d(grayPixels);
  const lowFreq: number[] = [];
  for (let u = 0; u < HASH_SIZE; u++) {
    for (let v = 0; v < HASH_SIZE; v++) {
      lowFreq.push(dct[u][v]);
    }
  }
  const relevant = lowFreq.slice(1);
  const mean = relevant.reduce((a, b) => a + b, 0) / relevant.length;
  let hash = 0n;
  for (let i = 0; i < relevant.length; i++) {
    if (relevant[i] > mean) hash |= (1n << BigInt(i));
  }
  return hash;
}

/** Berechnet pHash direkt aus einem JPEG/PNG-Buffer (via sharp). */
export async function hashFromBuffer(imageBuffer: Buffer): Promise<bigint> {
  const { data } = await sharp(imageBuffer)
    .resize(DCT_SIZE, DCT_SIZE, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: number[][] = Array.from({ length: DCT_SIZE }, (_, y) =>
    Array.from({ length: DCT_SIZE }, (_, x) => data[y * DCT_SIZE + x])
  );
  return computePhash(pixels);
}

/** Hamming-Distanz zwischen zwei pHashes. ≤ 10 → gleicher Inhalt. */
export function hammingDistance(a: bigint, b: bigint): number {
  let xor = a ^ b;
  let count = 0;
  while (xor > 0n) { xor &= xor - 1n; count++; }
  return count;
}

export const hashToHex = (h: bigint): string => h.toString(16).padStart(16, "0");
export const hexToHash = (s: string): bigint => BigInt("0x" + s);
export const isSameContent = (a: bigint, b: bigint): boolean => hammingDistance(a, b) <= 10;
