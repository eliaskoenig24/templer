/**
 * Führt alle Demos aus — testet den Core-Code ohne externe Dependencies.
 * `npm run demo` im backend/ Verzeichnis
 */
import { runDemo as consensusDemo } from "./consensus/bridge-consensus.js";
import { runDemo as phashDemo } from "./ingestion/phash.js";

consensusDemo();
phashDemo();
