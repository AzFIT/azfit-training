const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const JSON_DIR = 'json_output';

const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function insertBatch(table, rows) {
  try {
    const { data, error } = await supabase.from(table).insert(rows).select();
    if (error) {
      // If batch fails and rows > 1, split and retry
      if (rows.length > 1) {
        const mid = Math.floor(rows.length / 2);
        const left = await insertBatch(table, rows.slice(0, mid));
        const right = await insertBatch(table, rows.slice(mid));
        return {
          inserted: left.inserted + right.inserted,
          skipped: left.skipped + right.skipped,
          errors: left.errors + right.errors
        };
      }
      // Single row failed
      const row = rows[0];
      if (error.message && (error.message.includes('duplicate') || error.message.includes('violates unique'))) {
        return { inserted: 0, skipped: 1, errors: 0 };
      }
      console.warn(`  Row ${row.id || 'unknown'} failed: ${error.message}`);
      return { inserted: 0, skipped: 0, errors: 1 };
    }
    return { inserted: data.length, skipped: 0, errors: 0 };
  } catch (err) {
    console.error(`  Exception: ${err.message}`);
    if (rows.length > 1) {
      const mid = Math.floor(rows.length / 2);
      const left = await insertBatch(table, rows.slice(0, mid));
      const right = await insertBatch(table, rows.slice(mid));
      return {
        inserted: left.inserted + right.inserted,
        skipped: left.skipped + right.skipped,
        errors: left.errors + right.errors
      };
    }
    return { inserted: 0, skipped: 0, errors: 1 };
  }
}

async function deployFile(filepath, table, batchSize) {
  const filename = path.basename(filepath);
  console.log(`\nDeploying ${filename} to ${table}...`);
  const rows = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`  Total rows: ${rows.length}`);

  let totalInserted = 0, totalSkipped = 0, totalErrors = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const result = await insertBatch(table, batch);
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    totalErrors += result.errors;

    if ((i / batchSize + 1) % 2 === 0 || i + batchSize >= rows.length) {
      console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} | Inserted: ${totalInserted}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
    }
  }

  console.log(`  ✅ Done: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
  return { totalInserted, totalSkipped, totalErrors };
}

async function main() {
  const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json')).sort();

  let grandInserted = 0, grandSkipped = 0, grandErrors = 0;

  // Deploy programs (smaller batches since they have more columns)
  if (files.includes('programs.json')) {
    const r = await deployFile(path.join(JSON_DIR, 'programs.json'), 'programs', 100);
    grandInserted += r.totalInserted;
    grandSkipped += r.totalSkipped;
    grandErrors += r.totalErrors;
  }

  // Deploy prescriptions (larger batches)
  const prescFiles = files.filter(f => f.startsWith('prescriptions_'));
  for (const file of prescFiles) {
    const r = await deployFile(path.join(JSON_DIR, file), 'program_exercises', 1000);
    grandInserted += r.totalInserted;
    grandSkipped += r.totalSkipped;
    grandErrors += r.totalErrors;
  }

  console.log(`\n🏁 GRAND TOTAL: ${grandInserted} inserted, ${grandSkipped} skipped, ${grandErrors} errors`);
}

main().catch(console.error);
