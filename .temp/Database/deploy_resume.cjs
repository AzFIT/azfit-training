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
      if (rows.length > 1) {
        const mid = Math.floor(rows.length / 2);
        const left = await insertBatch(table, rows.slice(0, mid));
        const right = await insertBatch(table, rows.slice(mid));
        return { inserted: left.inserted + right.inserted, skipped: left.skipped + right.skipped, errors: left.errors + right.errors };
      }
      const row = rows[0];
      if (error.message && (error.message.includes('duplicate') || error.message.includes('violates unique'))) {
        return { inserted: 0, skipped: 1, errors: 0 };
      }
      console.warn(`  Row ${row.id} failed: ${error.message}`);
      return { inserted: 0, skipped: 0, errors: 1 };
    }
    return { inserted: data.length, skipped: 0, errors: 0 };
  } catch (err) {
    console.error(`  Exception: ${err.message}`);
    if (rows.length > 1) {
      const mid = Math.floor(rows.length / 2);
      const left = await insertBatch(table, rows.slice(0, mid));
      const right = await insertBatch(table, rows.slice(mid));
      return { inserted: left.inserted + right.inserted, skipped: left.skipped + right.skipped, errors: left.errors + right.errors };
    }
    return { inserted: 0, skipped: 0, errors: 1 };
  }
}

async function fileAlreadyDone(filepath, table) {
  const rows = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (rows.length === 0) return true;
  const firstId = rows[0].id;
  const lastId = rows[rows.length - 1].id;
  
  const { data, error } = await supabase.from(table).select('id').eq('id', firstId).limit(1);
  if (error) { console.log('Check error:', error.message); return false; }
  
  if (data && data.length > 0) {
    // Also check last ID to make sure entire file was processed
    const { data: lastData } = await supabase.from(table).select('id').eq('id', lastId).limit(1);
    if (lastData && lastData.length > 0) {
      console.log(`  ⏭️ Skipping ${path.basename(filepath)} — already deployed`);
      return true;
    }
  }
  return false;
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

  // Programs
  if (files.includes('programs.json')) {
    const filepath = path.join(JSON_DIR, 'programs.json');
    const done = await fileAlreadyDone(filepath, 'programs');
    if (!done) {
      const r = await deployFile(filepath, 'programs', 100);
      grandInserted += r.totalInserted;
      grandSkipped += r.totalSkipped;
      grandErrors += r.totalErrors;
    } else {
      grandSkipped += JSON.parse(fs.readFileSync(filepath, 'utf8')).length;
    }
  }

  // Prescriptions
  const prescFiles = files.filter(f => f.startsWith('prescriptions_'));
  for (const file of prescFiles) {
    const filepath = path.join(JSON_DIR, file);
    const done = await fileAlreadyDone(filepath, 'program_exercises');
    if (!done) {
      const r = await deployFile(filepath, 'program_exercises', 1000);
      grandInserted += r.totalInserted;
      grandSkipped += r.totalSkipped;
      grandErrors += r.totalErrors;
    } else {
      grandSkipped += JSON.parse(fs.readFileSync(filepath, 'utf8')).length;
    }
  }

  console.log(`\n🏁 GRAND TOTAL: ${grandInserted} inserted, ${grandSkipped} skipped, ${grandErrors} errors`);
}

main().catch(console.error);
