// Exports the TypeScript seed (`src/app/data/portalSeed.ts`, which already
// composes newsSeed + incidents + settings) into a plain JSON file that the PHP
// importer (`import_seed.php`) loads into MySQL. Run from the project root:
//
//   node api/migrations/export_seed.mjs
//
// Uses the project's own esbuild to transpile/bundle the TS on the fly, so the
// exported data is exactly what the frontend used to seed localStorage.
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

async function bundleModule(entry) {
  const result = await build({
    entryPoints: [path.resolve(root, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const tmp = path.resolve(here, '.bundle.tmp.mjs');
  writeFileSync(tmp, result.outputFiles[0].text);
  return import(path.toNamespaceURL ? path.toNamespaceURL(tmp) : `file://${tmp}?t=${Date.now()}`);
}

const seedMod = await bundleModule('src/app/data/portalSeed.ts');
const db = seedMod.seedDatabase;
if (!db || !Array.isArray(db.users)) {
  throw new Error('seedDatabase not found / malformed');
}

const outPath = path.resolve(here, 'seed_data.json');
writeFileSync(outPath, JSON.stringify(db, null, 2));

console.log('seed_data.json written:', outPath);
console.log('counts:', JSON.stringify({
  users: db.users.length,
  organizations: db.organizations.length,
  memberships: db.memberships.length,
  specialtyTags: db.specialtyTags.length,
  inviteCodes: db.inviteCodes.length,
  joinRequests: db.joinRequests.length,
  sections: db.sections.length,
  documents: db.documents.length,
  news: db.news.length,
  newsSubmissions: db.newsSubmissions.length,
  notifications: db.notifications.length,
  supportTickets: db.supportTickets.length,
  orgCreationRequests: db.orgCreationRequests.length,
  incidents: db.incidents.length,
}, null, 0));
