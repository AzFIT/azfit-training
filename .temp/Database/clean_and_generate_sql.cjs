const fs = require('fs');
const readline = require('readline');
const path = require('path');

// ── CONFIG ─────────────────────────────────────────────────────────
const INPUT_CSV = 'programs_detailed_boostcamp_kaggle.csv';
const OUTPUT_DIR = 'sql_output';
const MAX_PROGRAMS = 2000;        // Limit to top N programs by quality
const MIN_EXERCISES = 3;          // Min unique exercises per program
const CHUNK_SIZE = 5000;          // Rows per SQL chunk for prescriptions

// Starting IDs (must not conflict with existing data)
const START_PROGRAM_ID = 321;
const START_EXERCISE_ID = 15000;
const START_PRESCRIPTION_ID = 20000;

// ── REFERENCE MAPPINGS ─────────────────────────────────────────────
const GOAL_TO_CATEGORY = {
  'Bodybuilding': 4,               // Hypertrophy
  'Muscle & Sculpting': 2,         // Build Muscle
  'Powerbuilding': 2,              // Build Muscle
  'Powerlifting': 3,               // Strength
  'Olympic Weightlifting': 8,      // Sports Performance
  'Athletics': 8,                  // Sports Performance
  'Bodyweight Fitness': 7,         // General Fitness
};

const LEVEL_TO_LEVEL = {
  'Beginner': 1,
  'Novice': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Elite': 4,
};

// ── HELPERS ────────────────────────────────────────────────────────
function parsePythonList(str) {
  if (!str || str === '[]') return [];
  try {
    // Handle quoted strings like "['Beginner', 'Novice']"
    const cleaned = str.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract items between quotes
    const matches = str.match(/'([^']+)'/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")  // smart quotes
    .replace(/[\u201C\u201D]/g, '"');
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return "'" + String(val).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function mapGoalToCategory(goals) {
  for (const g of goals) {
    if (GOAL_TO_CATEGORY[g]) return GOAL_TO_CATEGORY[g];
  }
  return 7; // General Fitness default
}

function mapLevelToLevel(levels) {
  // Pick the highest level present
  let best = 1;
  for (const l of levels) {
    if (LEVEL_TO_LEVEL[l] && LEVEL_TO_LEVEL[l] > best) {
      best = LEVEL_TO_LEVEL[l];
    }
  }
  return best;
}

// ── MAIN PROCESSING ────────────────────────────────────────────────
async function main() {
  console.log('Loading existing exercises...');
  const existingExercises = JSON.parse(
    fs.readFileSync('existing_exercises.json', 'utf8')
  );
  console.log('Existing exercises loaded:', Object.keys(existingExercises).length);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  // Phase 1: Read and group by program
  console.log('Reading Boostcamp CSV...');
  const fileStream = fs.createReadStream(INPUT_CSV);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let rowCount = 0;
  const programsMap = new Map(); // title -> { metadata, exercises: Map<normName, {name, sets, reps, intensity, week, day, order}> }

  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      continue;
    }
    rowCount++;

    if (rowCount % 100000 === 0) {
      console.log(`  Processed ${rowCount.toLocaleString()} rows, ${programsMap.size} programs so far...`);
    }

    // Parse CSV with quoted fields
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length < 16) continue;

    const title = cols[0];
    const description = cols[1];
    const levelStr = cols[2];
    const goalStr = cols[3];
    const equipment = cols[4];
    const programLength = parseFloat(cols[5]) || 0;
    const timePerWorkout = parseFloat(cols[6]) || 0;
    const week = parseInt(cols[7]) || 1;
    const day = parseInt(cols[8]) || 1;
    const exerciseName = cols[10];
    const sets = parseInt(cols[11]) || 0;
    const reps = parseFloat(cols[12]) || 0;
    const intensity = parseFloat(cols[13]) || 0;

    // Skip bad rows
    if (!title || !exerciseName || sets <= 0) continue;

    if (!programsMap.has(title)) {
      programsMap.set(title, {
        title,
        description,
        levels: parsePythonList(levelStr),
        goals: parsePythonList(goalStr),
        equipment,
        programLength,
        timePerWorkout,
        exercises: new Map(),
        totalRows: 0,
      });
    }

    const prog = programsMap.get(title);
    prog.totalRows++;
    // Update metadata if this row has better data
    if (description && description.length > (prog.description?.length || 0)) {
      prog.description = description;
    }
    if (programLength > prog.programLength) prog.programLength = programLength;
    if (timePerWorkout > prog.timePerWorkout) prog.timePerWorkout = timePerWorkout;

    const normName = normalizeName(exerciseName);
    const key = `${week}|${day}|${normName}`;

    if (!prog.exercises.has(key)) {
      prog.exercises.set(key, {
        name: exerciseName,
        normName,
        sets,
        reps,
        intensity,
        week,
        day,
        order: prog.exercises.size + 1,
      });
    }
  }

  console.log(`\nTotal rows read: ${rowCount.toLocaleString()}`);
  console.log(`Total programs (raw): ${programsMap.size}`);

  // Phase 2: Filter and quality-rank programs
  const qualityPrograms = [];
  for (const prog of programsMap.values()) {
    const uniqueExercises = prog.exercises.size;
    if (uniqueExercises < MIN_EXERCISES) continue;
    if (!prog.description || prog.description.length < 20) continue;
    if (prog.programLength < 1) continue;

    // Quality score: more exercises + longer description = better
    const qualityScore = uniqueExercises * 10 + prog.description.length;
    qualityPrograms.push({ ...prog, qualityScore, uniqueExercises });
  }

  // Sort by quality and take top N
  qualityPrograms.sort((a, b) => b.qualityScore - a.qualityScore);
  const selectedPrograms = qualityPrograms.slice(0, MAX_PROGRAMS);

  console.log(`Quality programs after filtering: ${qualityPrograms.length}`);
  console.log(`Selected for import (top ${MAX_PROGRAMS}): ${selectedPrograms.length}`);
  console.log(`Quality score range: ${selectedPrograms[selectedPrograms.length - 1]?.qualityScore} - ${selectedPrograms[0]?.qualityScore}`);

  // Phase 3: Build exercise mapping
  const newExercises = [];     // { id, name, slug, equipment_id, ... }
  const exerciseNameToId = {}; // normName -> id (includes existing)
  let nextExerciseId = START_EXERCISE_ID;

  // Pre-populate with existing exercises
  for (const [normName, id] of Object.entries(existingExercises)) {
    exerciseNameToId[normName] = id;
  }

  for (const prog of selectedPrograms) {
    for (const ex of prog.exercises.values()) {
      if (exerciseNameToId[ex.normName]) continue;

      // Create new exercise
      const id = nextExerciseId++;
      exerciseNameToId[ex.normName] = id;

      // Try to infer equipment_id from name
      let equipmentId = null;
      const lowerName = ex.name.toLowerCase();
      if (lowerName.includes('dumbbell')) equipmentId = 2;
      else if (lowerName.includes('barbell')) equipmentId = 1;
      else if (lowerName.includes('kettlebell')) equipmentId = 3;
      else if (lowerName.includes('cable')) equipmentId = 31;
      else if (lowerName.includes('machine') || lowerName.includes('press') || lowerName.includes('pulldown')) equipmentId = 16; // Smith Machine generic
      else if (lowerName.includes('bodyweight') || lowerName.includes('push-up') || lowerName.includes('pull-up')) equipmentId = 39; // Pull-up bar
      else if (lowerName.includes('band') || lowerName.includes('resistance')) equipmentId = 44;

      newExercises.push({
        id,
        name: ex.name,
        slug: slugify(ex.name),
        equipment_id: equipmentId,
        exercise_type: 'compound', // default
        is_active: true,
      });
    }
  }

  console.log(`New exercises to create: ${newExercises.length}`);
  console.log(`Next exercise ID would be: ${nextExerciseId}`);

  // Phase 4: Assign program IDs
  let nextProgramId = START_PROGRAM_ID;
  let nextPrescriptionId = START_PRESCRIPTION_ID;
  const programInserts = [];
  const prescriptionInserts = [];

  for (const prog of selectedPrograms) {
    const programId = nextProgramId++;
    const categoryId = mapGoalToCategory(prog.goals);
    const levelId = mapLevelToLevel(prog.levels);
    const trainingDays = Math.max(1, ...Array.from(prog.exercises.values()).map(e => e.day));

    programInserts.push({
      id: programId,
      program_name: prog.title,
      slug: slugify(prog.title),
      description: prog.description,
      category_id: categoryId,
      level_id: levelId,
      duration_weeks: Math.round(prog.programLength) || 4,
      days_per_week: trainingDays,
      session_duration_minutes: Math.round(prog.timePerWorkout) || 45,
      training_split_id: 1, // Full Body default
      periodization_phase_id: 1, // General Preparation default
      is_active: true,
      is_public: true,
      is_featured: false,
      is_premium: false,
    });

    // Sort exercises by week, day, order
    const sortedExercises = Array.from(prog.exercises.values())
      .sort((a, b) => (a.week - b.week) || (a.day - b.day) || (a.order - b.order));

    let orderIndex = 1;
    let lastDay = null;
    for (const ex of sortedExercises) {
      if (lastDay !== null && ex.day !== lastDay) {
        orderIndex = 1;
      }
      lastDay = ex.day;

      const exerciseId = exerciseNameToId[ex.normName];
      const repsStr = ex.reps < 0 ? `${Math.abs(ex.reps)}s hold` : String(Math.round(ex.reps));

      prescriptionInserts.push({
        id: nextPrescriptionId++,
        program_id: programId,
        exercise_id: exerciseId,
        week_number: ex.week,
        day_number: ex.day,
        order_index: orderIndex++,
        set_type_id: 1, // Straight Set
        sets: ex.sets,
        reps_min: ex.reps > 0 ? Math.round(ex.reps) : 1,
        reps_max: null,
        reps_preset: repsStr,
        rest_seconds: 60,
        rest_preset: null,
        load_type: 'rpe',
        load_value: ex.intensity > 0 && ex.intensity <= 10 ? ex.intensity : 7,
        load_preset: `RPE ${ex.intensity > 0 && ex.intensity <= 10 ? ex.intensity : 7}.0`,
        tempo_preset: '2-0-1-0',
        notes: `From Boostcamp: ${prog.equipment || 'Various equipment'}.`,
        warmup_sets: 0,
        is_amrap: false,
        is_warmup: false,
        is_superset: false,
      });
    }
  }

  console.log(`\nPrograms to insert: ${programInserts.length}`);
  console.log(`Prescriptions to insert: ${prescriptionInserts.length}`);
  console.log(`Next program ID: ${nextProgramId}`);
  console.log(`Next prescription ID: ${nextPrescriptionId}`);

  // Phase 5: Write SQL files
  console.log('\nWriting SQL files...');

  // Programs SQL
  const programsSql = programInserts.map(p =>
    `INSERT INTO programs (id, program_name, slug, description, category_id, level_id, duration_weeks, days_per_week, session_duration_minutes, training_split_id, periodization_phase_id, is_active, is_public, is_featured, is_premium) VALUES (${p.id}, ${escapeSql(p.program_name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${p.category_id}, ${p.level_id}, ${p.duration_weeks}, ${p.days_per_week}, ${p.session_duration_minutes}, ${p.training_split_id}, ${p.periodization_phase_id}, ${p.is_active}, ${p.is_public}, ${p.is_featured}, ${p.is_premium});`
  ).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, '01_programs.sql'), programsSql);
  console.log('  01_programs.sql written');

  // Exercises SQL
  if (newExercises.length > 0) {
    const exercisesSql = newExercises.map(e =>
      `INSERT INTO exercises (id, exercise_name, slug, equipment_id, exercise_type, is_active) VALUES (${e.id}, ${escapeSql(e.name)}, ${escapeSql(e.slug)}, ${e.equipment_id || 'NULL'}, ${escapeSql(e.exercise_type)}, ${e.is_active});`
    ).join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, '02_exercises.sql'), exercisesSql);
    console.log('  02_exercises.sql written');
  }

  // Prescriptions SQL (chunked)
  let chunkIndex = 1;
  for (let i = 0; i < prescriptionInserts.length; i += CHUNK_SIZE) {
    const chunk = prescriptionInserts.slice(i, i + CHUNK_SIZE);
    const chunkSql = chunk.map(p =>
      `INSERT INTO program_exercises (id, program_id, exercise_id, week_number, day_number, order_index, set_type_id, sets, reps_min, reps_max, reps_preset, rest_seconds, rest_preset, load_type, load_value, load_preset, tempo_preset, notes, warmup_sets, is_amrap, is_warmup, is_superset) VALUES (${p.id}, ${p.program_id}, ${p.exercise_id}, ${p.week_number}, ${p.day_number}, ${p.order_index}, ${p.set_type_id}, ${p.sets}, ${p.reps_min}, ${p.reps_max || 'NULL'}, ${escapeSql(p.reps_preset)}, ${p.rest_seconds}, ${p.rest_preset || 'NULL'}, ${escapeSql(p.load_type)}, ${p.load_value}, ${escapeSql(p.load_preset)}, ${escapeSql(p.tempo_preset)}, ${escapeSql(p.notes)}, ${p.warmup_sets}, ${p.is_amrap}, ${p.is_warmup}, ${p.is_superset});`
    ).join('\n');
    const filename = `03_prescriptions_${String(chunkIndex).padStart(2, '0')}.sql`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), chunkSql);
    console.log(`  ${filename} written (${chunk.length} rows)`);
    chunkIndex++;
  }

  // Write summary
  const summary = {
    totalPrograms: programInserts.length,
    totalNewExercises: newExercises.length,
    totalPrescriptions: prescriptionInserts.length,
    nextProgramId,
    nextExerciseId,
    nextPrescriptionId,
    topPrograms: programInserts.slice(0, 10).map(p => ({ id: p.id, name: p.program_name, category_id: p.category_id, level_id: p.level_id })),
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('\n  summary.json written');

  console.log('\n✅ Done! SQL files ready in:', OUTPUT_DIR);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
