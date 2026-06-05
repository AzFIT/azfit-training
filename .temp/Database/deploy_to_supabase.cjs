const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ── CONFIG ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://mhwrqkfttjbxryhlmhti.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1od3Jxa2Z0dGpieHJ5aGxtaHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTczMDQsImV4cCI6MjA5NjEzMzMwNH0.-zR5wbwQl9JtV7G0gLcWarJIy75FZzvz3DnHvnNr3So';
const SQL_DIR = 'sql_output';
const BATCH_SIZE = 1000; // Supabase bulk insert limit

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── SQL PARSER ─────────────────────────────────────────────────────
function parseSqlInsert(line) {
  const match = line.match(/INSERT INTO (\w+) \(([^)]+)\) VALUES \((.+)\);\s*$/);
  if (!match) return null;

  const table = match[1];
  const columns = match[2].split(',').map(c => c.trim());
  const valuesStr = match[3];

  // Parse values (handling NULL, numbers, quoted strings)
  const values = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1];

    if (!inQuotes && (char === "'" || char === '"')) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      if (nextChar === quoteChar) {
        // Escaped quote
        current += char;
        i++; // skip next
      } else {
        inQuotes = false;
        quoteChar = null;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const obj = {};
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const val = values[i];
    obj[col] = parseValue(val);
  }

  return { table, obj };
}

function parseValue(val) {
  const trimmed = val.trim();
  if (trimmed === 'NULL') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  // Try number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10);
  }
  // String (remove surrounding quotes)
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'");
  }
  return trimmed;
}

// ── DEPLOYMENT ─────────────────────────────────────────────────────
async function deployFile(filepath, table) {
  console.log(`\nDeploying ${path.basename(filepath)} to ${table}...`);

  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let batch = [];
  let totalInserted = 0;
  let errors = 0;

  for await (const line of rl) {
    const parsed = parseSqlInsert(line);
    if (!parsed) continue;
    if (parsed.table !== table) {
      console.warn(`  Table mismatch: expected ${table}, got ${parsed.table}`);
      continue;
    }

    batch.push(parsed.obj);

    if (batch.length >= BATCH_SIZE) {
      const result = await insertBatch(table, batch);
      totalInserted += result.inserted;
      errors += result.errors;
      batch = [];
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    const result = await insertBatch(table, batch);
    totalInserted += result.inserted;
    errors += result.errors;
  }

  console.log(`  ✅ Inserted: ${totalInserted}, Errors: ${errors}`);
  return { totalInserted, errors };
}

async function insertBatch(table, rows) {
  try {
    const { data, error } = await supabase.from(table).insert(rows).select();
    if (error) {
      // Try individual inserts to identify failures
      console.warn(`  Batch insert failed for ${table}:`, error.message);
      let inserted = 0;
      for (const row of rows) {
        const { error: singleError } = await supabase.from(table).insert(row).select();
        if (singleError) {
          // Silent fail for duplicates or FK issues
          if (!singleError.message.includes('duplicate') && !singleError.message.includes('violates')) {
            console.warn(`    Row failed:`, singleError.message);
          }
        } else {
          inserted++;
        }
      }
      return { inserted, errors: rows.length - inserted };
    }
    return { inserted: data.length, errors: 0 };
  } catch (err) {
    console.error(`  Exception inserting into ${table}:`, err.message);
    return { inserted: 0, errors: rows.length };
  }
}

// ── MAIN ───────────────────────────────────────────────────────────
async function main() {
  // Get list of SQL files
  const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql')).sort();
  console.log('SQL files found:', files);

  let grandTotal = 0;
  let grandErrors = 0;

  // Deploy programs first
  if (files.includes('01_programs.sql')) {
    const result = await deployFile(path.join(SQL_DIR, '01_programs.sql'), 'programs');
    grandTotal += result.totalInserted;
    grandErrors += result.errors;
  }

  // Deploy exercises next
  if (files.includes('02_exercises.sql')) {
    const result = await deployFile(path.join(SQL_DIR, '02_exercises.sql'), 'exercises');
    grandTotal += result.totalInserted;
    grandErrors += result.errors;
  }

  // Deploy prescriptions last (in order)
  const prescriptionFiles = files.filter(f => f.startsWith('03_prescriptions_'));
  for (const file of prescriptionFiles) {
    const result = await deployFile(path.join(SQL_DIR, file), 'program_exercises');
    grandTotal += result.totalInserted;
    grandErrors += result.errors;
  }

  console.log(`\n🏁 GRAND TOTAL: ${grandTotal} rows inserted, ${grandErrors} errors`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
