const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const JSON_DIR = 'json_output';

const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function upsertBatch(table, rows) {
  try {
    const { data, error } = await supabase.from(table).upsert(rows, { onConflict: 'id', ignoreDuplicates: true }).select();
    if (error) {
      console.warn(`  Batch error: ${error.message}`);
      return { inserted: 0, errors: rows.length };
    }
    return { inserted: data.length, errors: 0 };
  } catch (err) {
    console.error(`  Exception: ${err.message}`);
    return { inserted: 0, errors: rows.length };
  }
}

async function deployFile(filepath, table, batchSize) {
  const filename = path.basename(filepath);
  console.log(`\nDeploying ${filename} to ${table}...`);
  const rows = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`  Total rows: ${rows.length}`);

  let totalInserted = 0, totalErrors = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const result = await upsertBatch(table, batch);
    totalInserted += result.inserted;
    totalErrors += result.errors;

    if ((i / batchSize + 1) % 5 === 0 || i + batchSize >= rows.length) {
      console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} | Inserted: ${totalInserted}, Errors: ${totalErrors}`);
    }
  }

  console.log(`  ✅ Done: ${totalInserted} inserted, ${totalErrors} errors`);
  return { totalInserted, totalErrors };
}

async function main() {
  const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json')).sort();

  let grandInserted = 0, grandErrors = 0;

  // Deploy prescriptions only (programs and exercises are already done)
  const prescFiles = files.filter(f => f.startsWith('prescriptions_'));
  for (const file of prescFiles) {
    const r = await deployFile(path.join(JSON_DIR, file), 'program_exercises', 1000);
    grandInserted += r.totalInserted;
    grandErrors += r.totalErrors;
  }

  console.log(`\n🏁 GRAND TOTAL: ${grandInserted} inserted, ${grandErrors} errors`);
}

main().catch(console.error);
