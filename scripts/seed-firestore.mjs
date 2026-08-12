#!/usr/bin/env node
/**
 * Loads the sample directory from src/data/seed-vendors.ts into a real
 * Firestore project, so a fresh install has something to look at.
 *
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":...}' npm run seed
 *
 * Safe to re-run: documents are written by a deterministic id, so a second run
 * updates rather than duplicates. Pass --wipe to delete the seeded vendors and
 * their slug pointers instead.
 */

import { readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const WIPE = process.argv.includes('--wipe')

async function loadSeeds() {
  // The seed data is TypeScript, so bundle it to a temp ESM file first rather
  // than keeping a second, drifting copy of the same records in this script.
  const { build } = await import('esbuild')
  const outfile = join(tmpdir(), `tfh-seed-${process.pid}.mjs`)
  await build({
    entryPoints: ['src/data/seed-vendors.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  })
  try {
    const module = await import(pathToFileURL(outfile).href)
    return module.SEED_VENDORS
  } finally {
    await rm(outfile, { force: true })
  }
}

async function credentials() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (inline) return JSON.parse(inline)

  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json'
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    console.error(
      `\nNo credentials found.\n` +
        `Set FIREBASE_SERVICE_ACCOUNT_JSON, or save your service account key as ${path}.\n` +
        `Firebase console -> Project settings -> Service accounts -> Generate new private key.\n`,
    )
    process.exit(1)
  }
}

async function main() {
  const [{ cert, initializeApp }, { getFirestore }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore'),
  ])

  const app = initializeApp({ credential: cert(await credentials()) })
  const db = getFirestore(app)
  const vendors = await loadSeeds()

  if (WIPE) {
    const batch = db.batch()
    for (const vendor of vendors) {
      batch.delete(db.collection('vendors').doc(vendor.id))
      batch.delete(db.collection('slugs').doc(vendor.slug))
    }
    await batch.commit()
    console.log(`Removed ${vendors.length} seeded listings.`)
    return
  }

  const batch = db.batch()
  for (const vendor of vendors) {
    const { id, ...data } = vendor
    batch.set(db.collection('vendors').doc(id), data, { merge: true })
    batch.set(
      db.collection('slugs').doc(vendor.slug),
      { vendorId: id, ownerId: vendor.ownerId },
      { merge: true },
    )
  }
  await batch.commit()

  console.log(`Seeded ${vendors.length} listings.`)
  console.log('Remember to make yourself an admin:')
  console.log("  users/<your-uid>  ->  { role: 'admin' }")
}

// Keep a machine-readable copy next to the script for anyone who would rather
// import the data somewhere else.
async function dumpJson(vendors) {
  await writeFile('scripts/seed-vendors.json', JSON.stringify(vendors, null, 2))
}

if (process.argv.includes('--json')) {
  loadSeeds().then(dumpJson).then(() => console.log('Wrote scripts/seed-vendors.json'))
} else {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
