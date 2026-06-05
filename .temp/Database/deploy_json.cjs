const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const JSON_DIR = 'json_output';
const BATCH_SIZE = 1000;

// Read API key from .env
const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function insertBatch(table, rows) {
  try {
    const { data, error } = await supabase.from(table).insert(rows).select();
    if (error) {
      // Check if it's a duplicate key error — we can ignore those
      if (error.message && (error.message.includes('duplicate') || error.message.includes('violates unique constraint'))) {
        return { inserted: 0, skipped: rows.length, errors: 0 };
      }
      console.warn(`  Batch error: ${error.message} — retrying individually...`);
      let inserted = 0;
      let errors = 0;
      for (const row of rows) {
        const { error: e2 } = await supabase.from(table).insert(row).select();
        if (e2) {
          if (e2.message && (e2.message.includes('duplicate') || e2.message.includes('violates unique'))) {
            // skip
          } else {
            errors++;
            if (errors <= 3) console.warn(`    Row error: ${e2.message}`);
          }
        } else {
          inserted++;
        }
      }
      return { inserted, skipped: rows.length - inserted - errors, errors };
    }
    return { inserted: data.length, skipped: 0, errors: 0 };
  } catch (err) {
    console.error(`  Exception: ${err.message}`);
    return { inserted: 0, skipped: 0, errors: rows.length };
  }
}

async function deployFile(filepath, table) {
  const filename = path.basename(filepath);
  console.log(`\nDeploying ${filename} to ${table}...`);

  const rows = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`  Total rows: ${rows.length}`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const result = await insertBatch(table, batch);
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    totalErrors += result.errors;

    if ((i / BATCH_SIZE + 1) % 5 === 0 || i + BATCH_SIZE >= rows.length) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} | Inserted: ${totalInserted}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
    }
  }

  console.log(`  ✅ Done: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
  return { totalInserted, totalSkipped, totalErrors };
}

async function main() {
  const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json')).sort();
  console.log('JSON files:', files);

  let grandInserted = 0;
  let grandSkipped = 0;
  let grandErrors = 0;

  // Deploy programs first
  if (files.includes('programs.json')) {
    const r = await deployFile(path.join(JSON_DIR, 'programs.json'), 'programs');
    grandInserted += r.totalInserted;
    grandSkipped += r.totalSkipped;
    grandErrors += r.totalErrors;
  }

  // Deploy exercises
  if (files.includes('exercises.json')) {
    const r = await deployFile(path.join(JSON_DIR, 'exercises.json'), 'exercises');
    grandInserted += r.totalInserted;
    grandSkipped += r.totalSkipped;
    grandErrors += r.totalErrors;
  }

  // Deploy prescriptions
  const prescFiles = files.filter(f => f.startsWith('prescriptions_'));
  for (const file of prescFiles) {
    const r = await deployFile(path.join(JSON_DIR, file), 'program_exercises');
    grandInserted += r.totalInserted;
    grandSkipped += r.totalSkipped;
    grandErrors += r.totalErrors;
  }

  console.log(`\n🏁 GRAND TOTAL: ${grandInserted} inserted, ${grandSkipped} skipped, ${grandErrors} errors`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
