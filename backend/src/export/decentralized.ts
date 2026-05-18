/**
 * DEZENTRALER EXPORT — ZENSURRESISTENZ
 * =====================================
 * Verifizierte Cluster werden auf unveränderliche Speicher gepusht:
 * - IPFS: Content-Addressable, weltweit repliziert (kostenlos)
 * - Arweave: Permanent gespeichert, zahlt einmalig (Arweave-Token)
 *
 * WARUM DAS WICHTIG IST:
 * Wenn ein Regime Agoras Server abschaltet, sind alle verifizierten
 * Meldungen bereits auf IPFS/Arweave — unveränderlich, dezentral,
 * für jeden Forscher und Journalisten abrufbar.
 *
 * npm install kubo-rpc-client arweave
 */

export interface ExportedCluster {
  clusterId: string;
  phash: string;
  reportCount: number;
  consensusScore: number;
  isVerified: boolean;
  exportedAt: string;
  reports: Array<{
    platform: string;
    category: string;
    description: string;
    createdAt: string;
    reporterCountry?: string;
  }>;
}

// ---------------------------------------------------------------------------
// IPFS — npm install kubo-rpc-client
// ---------------------------------------------------------------------------
/*
import { create as createIpfsClient } from "kubo-rpc-client";

const ipfs = createIpfsClient({ url: "http://localhost:5001" });

export async function publishToIpfs(cluster: ExportedCluster): Promise<string> {
  const json = JSON.stringify(cluster, null, 2);
  const { cid } = await ipfs.add(json);
  const cidStr = cid.toString();

  // CID in Supabase speichern für spätere Referenz
  // supabase.from("clusters").update({ ipfs_cid: cidStr }).eq("id", cluster.clusterId)

  console.log(`IPFS: Cluster ${cluster.clusterId} → ipfs://${cidStr}`);
  return cidStr;
}

// Pinata als gehosteter IPFS-Dienst (einfacher als lokaler Node):
// https://api.pinata.cloud/pinning/pinJSONToIPFS
export async function publishToPinata(cluster: ExportedCluster): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${process.env.PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent:  cluster,
      pinataMetadata: { name: `agora-cluster-${cluster.clusterId}` },
    }),
  });
  const { IpfsHash } = await res.json();
  return IpfsHash;
}
*/

// ---------------------------------------------------------------------------
// Arweave — npm install arweave
// ---------------------------------------------------------------------------
/*
import Arweave from "arweave";

const arweave = Arweave.init({
  host:     "arweave.net",
  port:     443,
  protocol: "https",
});

export async function publishToArweave(
  cluster: ExportedCluster,
  walletKeyfile: object  // Arweave-Wallet JSON
): Promise<string> {
  const tx = await arweave.createTransaction(
    { data: JSON.stringify(cluster) },
    walletKeyfile
  );

  tx.addTag("Content-Type",  "application/json");
  tx.addTag("App-Name",      "Agora");
  tx.addTag("Cluster-ID",    cluster.clusterId);
  tx.addTag("Category",      cluster.reports[0]?.category ?? "unknown");
  tx.addTag("Verified",      String(cluster.isVerified));

  await arweave.transactions.sign(tx, walletKeyfile);
  await arweave.transactions.post(tx);

  const txId = tx.id;
  console.log(`Arweave: Cluster ${cluster.clusterId} → https://arweave.net/${txId}`);
  return txId;
}
*/

// ---------------------------------------------------------------------------
// Batch-Export aller verifizierten Cluster (z.B. als täglicher Cron-Job)
// ---------------------------------------------------------------------------
export async function batchExportVerified(
  supabase: { from: (t: string) => unknown }
): Promise<void> {
  const db = supabase.from("clusters") as {
    select: (cols: string) => {
      eq: (col: string, val: boolean) => {
        is: (col: string, val: null) => Promise<{ data: ExportedCluster[] | null }>
      }
    }
  };

  const { data: clusters } = await db
    .select("*")
    .eq("is_verified", true)
    .is("ipfs_cid", null); // Nur noch nicht exportierte

  if (!clusters || clusters.length === 0) {
    console.log("Kein neuer Export notwendig.");
    return;
  }

  console.log(`Exportiere ${clusters.length} verifizierte Cluster...`);
  for (const cluster of clusters) {
    // await publishToPinata(cluster);
    // await publishToArweave(cluster, wallet);
    console.log(`[MOCK] Cluster ${cluster.clusterId} exportiert`);
  }
}
