// HomeLedger — a household budget site, handed in as a make.fun entry
// (Node 22+, standard library only). The site is this directory's app/
// folder: plain static files a browser opens at app/index.html (ES modules
// and CSS, no build step, no network request), its content held in its own
// files. This program copies app/ and screenshots/ from beside this file
// into the output directory and writes output/dossier.json, the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source), using the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to
// be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly before copying anything if the entry is incomplete: the
// scorer refuses an entry with no screenshots, and a missing app/ would
// hand in an empty site.
// The scorer refuses an entry with fewer than 3 or more than 4
// screenshots, so check the count up front and fail loudly.
function assertScreenshotCount(names) {
  if (names.length < 3 || names.length > 4) {
    throw new Error(`expected 3 or 4 screenshots, found ${names.length}`);
  }
}

const appIndex = join(repoDir, 'app', 'index.html');
const shotsDir = join(repoDir, 'screenshots');
if (!existsSync(appIndex)) throw new Error('missing app/index.html');
if (!existsSync(shotsDir)) throw new Error('missing screenshots/');
const shotNames = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
assertScreenshotCount(shotNames);

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// The dossier must parse as JSON and stay under the scorer's 1.5 MiB
// cap. A corrupt or oversized dossier would fail the gate after the
// entry is submitted. (buildDossier returns bytes, not a string, so
// decode it first.)
const dossierBytes = Buffer.from(dossier).length;
const dossierText = Buffer.from(dossier).toString('utf8');
assertDossierFits(dossierText, dossierBytes);

function assertDossierFits(text, bytes) {
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('dossier.json did not parse to an object');
  }
  if (bytes > 1572864) {
    throw new Error(`dossier.json is ${bytes} bytes, over the 1.5 MiB cap`);
  }
}

// A deterministic summary on stdout, so two runs can be compared byte for
// byte: file counts and sizes only, nothing time-dependent.
function walkTree(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = walkTree(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

const appTotals = walkTree(join(outputDir, 'app'));
const shotTotals = walkTree(join(outputDir, 'screenshots'));
console.log(`homeledger: app ${appTotals.files} files ${appTotals.bytes} bytes; screenshots ${shotTotals.files} files ${shotTotals.bytes} bytes; dossier ${dossierBytes} bytes`);
