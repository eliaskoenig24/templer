/**
 * PERCEPTUAL HASHING (pHash)
 * ==========================
 * Fingerabdruck eines Bildes, der robust gegen kleine Änderungen ist:
 * Kompression, Größenänderung, Unschärfe, leichte Farbanpassungen.
 *
 * Damit landen Screenshots desselben Fake-News-Inhalts automatisch
 * im selben Cluster — auch wenn jeder Nutzer einen leicht anderen
 * Screenshot gemacht hat.
 *
 * ALGORITHMUS (DCT-basiertes pHash):
 * 1. Bild auf 32×32 px verkleinern, Graustufen
 * 2. 2D DCT (Discrete Cosine Transform) berechnen
 * 3. Nur die 8×8 Tieffrequenzkomponenten behalten (top-left)
 *    → Diese repräsentieren die "Essenz" des Bildes
 * 4. Jeden der 64 Werte mit dem Mittelwert vergleichen → 64-Bit-Hash
 *
 * ÄHNLICHKEIT: Hamming-Distanz ≤ 10 → gleicher Inhalt
 * (10 von 64 Bits verschieden = ~85% Übereinstimmung)
 *
 * ABHÄNGIGKEIT: npm install jimp
 * Jimp ist eine reine Node.js Bildverarbeitungsbibliothek, kein C/C++-Binding nötig.
 */

// Typen-Import ohne Runtime-Abhängigkeit (für Tree-Shaking)
// Beim Einsatz: npm install jimp @types/jimp
// import Jimp from "jimp";

const HASH_SIZE = 8;       // 8×8 = 64 Bit
const DCT_SIZE  = 32;      // Bild wird auf 32×32 verkleinert

/**
 * 2D Discrete Cosine Transform (Typ II, normalisiert).
 * Wandelt räumliche Pixelwerte in Frequenzkomponenten um.
 * Tieffrequente Komponenten (oben links) = Grundstruktur des Bildes.
 */
function dct2d(pixels: number[][]): number[][] {
  const N = pixels.length;
  const result: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));

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
      // Normalisierungsfaktoren (c_u, c_v)
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      result[u][v] = (2 / N) * cu * cv * sum;
    }
  }
  return result;
}

/**
 * Berechnet den 64-Bit perceptual Hash eines Bildes.
 *
 * @param grayPixels - 32×32 Array mit Graustufenwerten (0–255)
 * @returns 64-Bit Hash als BigInt
 */
export function computePhash(grayPixels: number[][]): bigint {
  // 1. DCT auf 32×32 Pixelmatrix
  const dct = dct2d(grayPixels);

  // 2. Nur die 8×8 Tieffrequenzkomponenten extrahieren (DC-Komponente [0,0] ausschließen)
  const lowFreq: number[] = [];
  for (let u = 0; u < HASH_SIZE; u++) {
    for (let v = 0; v < HASH_SIZE; v++) {
      lowFreq.push(dct[u][v]);
    }
  }

  // 3. Mittelwert berechnen (ohne DC-Komponente bei [0,0] — enthält Gesamthelligkeit)
  const relevant = lowFreq.slice(1); // DC-Komponente überspringen
  const mean = relevant.reduce((a, b) => a + b, 0) / relevant.length;

  // 4. Binärer Hash: 1 wenn Wert > Mittelwert, sonst 0
  let hash = 0n;
  for (let i = 0; i < relevant.length; i++) {
    if (relevant[i] > mean) {
      hash |= (1n << BigInt(i));
    }
  }
  return hash;
}

/**
 * Hamming-Distanz zwischen zwei pHashes.
 * 0 = identisch, ≤ 10 = gleicher Inhalt, > 10 = anderes Bild.
 */
export function hammingDistance(a: bigint, b: bigint): number {
  let xor = a ^ b;
  let count = 0;
  while (xor > 0n) {
    xor &= xor - 1n; // Löscht das niederwertigste gesetzte Bit (Brian Kernighan's Trick)
    count++;
  }
  return count;
}

/**
 * Konvertiert einen pHash in einen hexadezimalen String (für DB-Speicherung).
 */
export function hashToHex(hash: bigint): string {
  return hash.toString(16).padStart(16, "0");
}

export function hexToHash(hex: string): bigint {
  return BigInt("0x" + hex);
}

/**
 * Gibt an, ob zwei Bilder wahrscheinlich den gleichen Inhalt zeigen.
 */
export function isSameContent(a: bigint, b: bigint): boolean {
  return hammingDistance(a, b) <= 10;
}

// ---------------------------------------------------------------------------
// Integration mit Jimp (auskommentiert — aktivieren nach `npm install jimp`)
// ---------------------------------------------------------------------------
/*
export async function hashFromBuffer(imageBuffer: Buffer): Promise<bigint> {
  const image = await Jimp.read(imageBuffer);

  // Auf 32×32 Graustufen verkleinern
  image.resize(DCT_SIZE, DCT_SIZE).greyscale();

  // Pixelwerte in 2D-Array konvertieren
  const pixels: number[][] = Array.from(
    { length: DCT_SIZE },
    (_, x) => Array.from(
      { length: DCT_SIZE },
      (_, y) => {
        const pixel = image.getPixelColor(x, y);
        // Jimp gibt RGBA zurück; bei Graustufen sind R=G=B
        return (pixel >> 24) & 0xff;
      }
    )
  );

  return computePhash(pixels);
}
*/

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------
export function runDemo(): void {
  // Synthetisches Beispiel: Ein "Bild" als 32×32 Matrix mit einem Muster
  const makeImage = (seed: number): number[][] =>
    Array.from({ length: 32 }, (_, x) =>
      Array.from({ length: 32 }, (_, y) =>
        Math.abs(Math.sin((x + y + seed) * 0.3) * 200)
      )
    );

  const original = makeImage(0);
  // Leicht modifiziertes Bild (Screenshot mit anderer Kompression — +5 Helligkeit):
  const similar  = makeImage(0).map(row => row.map(v => Math.min(255, v + 5)));
  // Komplett anderes Bild (zufälliges Rauschen):
  const different: number[][] = Array.from(
    { length: 32 },
    () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
  );

  const h1 = computePhash(original);
  const h2 = computePhash(similar);
  const h3 = computePhash(different);

  console.log("\n=== PHASH DEMO ===");
  console.log(`Original:    ${hashToHex(h1)}`);
  console.log(`Ähnlich:     ${hashToHex(h2)}  Distanz: ${hammingDistance(h1, h2)}`);
  console.log(`Verschieden: ${hashToHex(h3)}  Distanz: ${hammingDistance(h1, h3)}`);
  console.log(`Gleicher Inhalt (original↔ähnlich)?   ${isSameContent(h1, h2)}`);
  console.log(`Gleicher Inhalt (original↔verschieden)? ${isSameContent(h1, h3)}`);
}
