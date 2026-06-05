const fs = require('fs');
const readline = require('readline');
const path = require('path');

// ── CONFIG ─────────────────────────────────────────────────────────
const INPUT_CSV = 'programs_detailed_boostcamp_kaggle.csv';
const OUTPUT_DIR = 'sql_output_v2';
const JSON_DIR = 'json_output';
const MAX_PROGRAMS = 2000;
const MIN_EXERCISES = 3;

const START_PROGRAM_ID = 321;
const START_EXERCISE_ID = 15000;
const START_PRESCRIPTION_ID = 20000;

// ── LOAD REFERENCE DATA ────────────────────────────────────────────
const refs = JSON.parse(fs.readFileSync('reference_data.json', 'utf8'));

// Build lookup maps
const minutesToTimeId = {};
refs.time_durations.forEach(r => { minutesToTimeId[r.minutes] = r.id; });

const weeksToDurationId = {};
refs.program_durations.forEach(r => { weeksToDurationId[r.weeks] = r.id; });

const daysToDaysId = {};
refs.days_per_week.forEach(r => { daysToDaysId[r.days] = r.id; });

// ── MAPPINGS ───────────────────────────────────────────────────────
const GOAL_TO_CATEGORY = {
  'Bodybuilding': 4,
  'Muscle & Sculpting': 2,
  'Powerbuilding': 2,
  'Powerlifting': 3,
  'Olympic Weightlifting': 8,
  'Athletics': 8,
  'Bodyweight Fitness': 7,
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
    const cleaned = str.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch {
    const matches = str.match(/'([^']+)'/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
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
  if (typeof val === 'boolean') return val;
  return "'" + String(val).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function mapGoalToCategory(goals) {
  for (const g of goals) {
    if (GOAL_TO_CATEGORY[g]) return GOAL_TO_CATEGORY[g];
  }
  return 7;
}

function mapLevelToLevel(levels) {
  let best = 1;
  for (const l of levels) {
    if (LEVEL_TO_LEVEL[l] && LEVEL_TO_LEVEL[l] > best) {
      best = LEVEL_TO_LEVEL[l];
    }
  }
  return best;
}

function getTimeDurationId(minutes) {
  // Find closest match
  const available = Object.keys(minutesToTimeId).map(Number).sort((a, b) => a - b);
  let closest = available[0];
  for (const m of available) {
    if (Math.abs(m - minutes) < Math.abs(closest - minutes)) {
      closest = m;
    }
  }
  return minutesToTimeId[closest] || 2; // default 45 min
}

function getProgramDurationId(weeks) {
  const available = Object.keys(weeksToDurationId).map(Number).sort((a, b) => a - b);
  let closest = available[0];
  for (const w of available) {
    if (Math.abs(w - weeks) < Math.abs(closest - weeks)) {
      closest = w;
    }
  }
  return weeksToDurationId[closest] || 1; // default 4 weeks
}

function getDaysPerWeekId(days) {
  days = Math.max(1, Math.min(7, Math.round(days)));
  return daysToDaysId[days] || daysToDaysId[3]; // default 3 days
}

function inferTrainingSplitId(days) {
  days = Math.round(days);
  if (days <= 3) return 1; // Full Body
  if (days === 4) return 2; // Upper/Lower
  if (days === 5) return 5; // Bro Split
  if (days >= 6) return 3; // Push/Pull/Legs
  return 1;
}

function inferEquipmentId(exerciseName) {
  const lower = exerciseName.toLowerCase();
  if (lower.includes('dumbbell')) return 2;
  if (lower.includes('barbell')) return 1;
  if (lower.includes('kettlebell')) return 3;
  if (lower.includes('cable')) return 31;
  if (lower.includes('machine') || lower.includes('press') || lower.includes('pulldown')) return 16;
  if (lower.includes('bodyweight') || lower.includes('push-up') || lower.includes('pull-up')) return 39;
  if (lower.includes('band') || lower.includes('resistance')) return 44;
  return null;
}

// ── MAIN PROCESSING ────────────────────────────────────────────────
async function main() {
  console.log('Loading existing exercises...');
  const existingExercises = JSON.parse(fs.readFileSync('existing_exercises.json', 'utf8'));
  console.log('Existing exercises loaded:', Object.keys(existingExercises).length);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR);

  // Phase 1: Read and group by program
  console.log('Reading Boostcamp CSV...');
  const fileStream = fs.createReadStream(INPUT_CSV);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let rowCount = 0;
  const programsMap = new Map();

  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      continue;
    }
    rowCount++;
    if (rowCount % 100000 === 0) {
      console.log(`  Processed ${rowCount.toLocaleString()} rows, ${programsMap.size} programs...`);
    }

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

    if (!title || !exerciseName || sets <= 0) continue;

    if (!programsMap.has(title)) {
      programsMap.set(title, {
        title, description, equipment,
        programLength: 0, timePerWorkout: 0,
        levels: parsePythonList(levelStr),
        goals: parsePythonList(goalStr),
        exercises: new Map(),
        totalRows: 0,
      });
    }

    const prog = programsMap.get(title);
    prog.totalRows++;
    if (description && description.length > (prog.description?.length || 0)) {
      prog.description = description;
    }
    if (programLength > prog.programLength) prog.programLength = programLength;
    if (timePerWorkout > prog.timePerWorkout) prog.timePerWorkout = timePerWorkout;

    const normName = normalizeName(exerciseName);
    const key = `${week}|${day}|${normName}`;
    if (!prog.exercises.has(key)) {
      prog.exercises.set(key, { name: exerciseName, normName, sets, reps, intensity, week, day, order: prog.exercises.size + 1 });
    }
  }

  console.log(`\nTotal rows: ${rowCount.toLocaleString()}`);
  console.log(`Raw programs: ${programsMap.size}`);

  // Phase 2: Filter
  const qualityPrograms = [];
  for (const prog of programsMap.values()) {
    if (prog.exercises.size < MIN_EXERCISES) continue;
    if (!prog.description || prog.description.length < 20) continue;
    if (prog.programLength < 1) continue;
    const score = prog.exercises.size * 10 + prog.description.length;
    qualityPrograms.push({ ...prog, qualityScore: score });
  }
  qualityPrograms.sort((a, b) => b.qualityScore - a.qualityScore);
  const selected = qualityPrograms.slice(0, MAX_PROGRAMS);

  console.log(`Quality programs: ${qualityPrograms.length}`);
  console.log(`Selected: ${selected.length}`);

  // Phase 3: Build exercises
  const newExercises = [];
  const exerciseNameToId = { ...existingExercises };
  let nextExerciseId = START_EXERCISE_ID;

  for (const prog of selected) {
    for (const ex of prog.exercises.values()) {
      if (exerciseNameToId[ex.normName]) continue;
      const id = nextExerciseId++;
      exerciseNameToId[ex.normName] = id;
      newExercises.push({
        id, name: ex.name, slug: slugify(ex.name),
        equipment_id: inferEquipmentId(ex.name),
        exercise_type: 'compound', is_active: true,
      });
    }
  }

  console.log(`New exercises: ${newExercises.length}`);

  // Phase 4: Build program and prescription objects
  let nextProgramId = START_PROGRAM_ID;
  let nextPrescriptionId = START_PRESCRIPTION_ID;
  const programRows = [];
  const prescriptionRows = [];

  for (const prog of selected) {
    const programId = nextProgramId++;
    const categoryId = mapGoalToCategory(prog.goals);
    const levelId = mapLevelToLevel(prog.levels);
    const trainingDays = Math.max(1, ...Array.from(prog.exercises.values()).map(e => e.day));

    programRows.push({
      id: programId,
      name: prog.title,
      slug: slugify(prog.title),
      description: prog.description,
      category_id: categoryId,
      level_id: levelId,
      program_duration_id: getProgramDurationId(prog.programLength),
      time_duration_id: getTimeDurationId(prog.timePerWorkout),
      days_per_week_id: getDaysPerWeekId(trainingDays),
      training_split_id: inferTrainingSplitId(trainingDays),
      periodization_phase_id: 1,
      is_active: true,
      is_public: true,
      is_featured: false,
      is_premium: false,
      total_workouts: trainingDays,
      total_exercises: prog.exercises.size,
    });

    const sortedEx = Array.from(prog.exercises.values())
      .sort((a, b) => (a.week - b.week) || (a.day - b.day) || (a.order - b.order));

    let orderIndex = 1;
    let lastDay = null;
    for (const ex of sortedEx) {
      if (lastDay !== null && ex.day !== lastDay) orderIndex = 1;
      lastDay = ex.day;

      const exerciseId = exerciseNameToId[ex.normName];
      const repsStr = ex.reps < 0 ? `${Math.abs(ex.reps)}s hold` : String(Math.round(ex.reps));

      prescriptionRows.push({
        id: nextPrescriptionId++,
        program_id: programId,
        exercise_id: exerciseId,
        week_number: ex.week,
        day_number: ex.day,
        order_index: orderIndex++,
        set_type_id: 1,
        sets: ex.sets,
        reps_min: ex.reps > 0 ? Math.round(ex.reps) : 1,
        reps_max: null,
        reps_preset: repsStr,
        rest_seconds: 60,
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

  console.log(`\nPrograms: ${programRows.length}`);
  console.log(`Prescriptions: ${prescriptionRows.length}`);

  // Phase 5: Write JSON files for deployment
  console.log('\nWriting JSON files...');
  fs.writeFileSync(path.join(JSON_DIR, 'programs.json'), JSON.stringify(programRows));
  fs.writeFileSync(path.join(JSON_DIR, 'exercises.json'), JSON.stringify(newExercises));

  // Split prescriptions into chunks
  const CHUNK_SIZE = 5000;
  let chunkIndex = 1;
  for (let i = 0; i < prescriptionRows.length; i += CHUNK_SIZE) {
    const chunk = prescriptionRows.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(
      path.join(JSON_DIR, `prescriptions_${String(chunkIndex).padStart(2, '0')}.json`),
      JSON.stringify(chunk)
    );
    chunkIndex++;
  }

  // Phase 6: Write SQL files (corrected schema)
  console.log('Writing SQL files...');

  const programsSql = programRows.map(p =>
    `INSERT INTO programs (id, name, slug, description, category_id, level_id, program_duration_id, time_duration_id, days_per_week_id, training_split_id, periodization_phase_id, is_active, is_public, is_featured, is_premium, total_workouts, total_exercises) VALUES (${p.id}, ${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${p.category_id}, ${p.level_id}, ${p.program_duration_id}, ${p.time_duration_id}, ${p.days_per_week_id}, ${p.training_split_id}, ${p.periodization_phase_id}, ${p.is_active}, ${p.is_public}, ${p.is_featured}, ${p.is_premium}, ${p.total_workouts}, ${p.total_exercises});`
  ).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, '01_programs.sql'), programsSql);

  if (newExercises.length > 0) {
    const exercisesSql = newExercises.map(e =>
      `INSERT INTO exercises (id, name, slug, equipment_id, exercise_type, is_active) VALUES (${e.id}, ${escapeSql(e.name)}, ${escapeSql(e.slug)}, ${e.equipment_id || 'NULL'}, ${escapeSql(e.exercise_type)}, ${e.is_active});`
    ).join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, '02_exercises.sql'), exercisesSql);
  }

  const prescChunkSize = 5000;
  let prescChunkIndex = 1;
  for (let i = 0; i < prescriptionRows.length; i += prescChunkSize) {
    const chunk = prescriptionRows.slice(i, i + prescChunkSize);
    const chunkSql = chunk.map(p =>
      `INSERT INTO program_exercises (id, program_id, exercise_id, week_number, day_number, order_index, set_type_id, sets, reps_min, reps_max, reps_preset, rest_seconds, load_type, load_value, load_preset, tempo_preset, notes, warmup_sets, is_amrap, is_warmup, is_superset) VALUES (${p.id}, ${p.program_id}, ${p.exercise_id}, ${p.week_number}, ${p.day_number}, ${p.order_index}, ${p.set_type_id}, ${p.sets}, ${p.reps_min}, ${p.reps_max || 'NULL'}, ${escapeSql(p.reps_preset)}, ${p.rest_seconds}, ${escapeSql(p.load_type)}, ${p.load_value}, ${escapeSql(p.load_preset)}, ${escapeSql(p.tempo_preset)}, ${escapeSql(p.notes)}, ${p.warmup_sets}, ${p.is_amrap}, ${p.is_warmup}, ${p.is_superset});`
    ).join('\n');
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `03_prescriptions_${String(prescChunkIndex).padStart(2, '0')}.sql`),
      chunkSql
    );
    prescChunkIndex++;
  }

  const summary = {
    totalPrograms: programRows.length,
    totalNewExercises: newExercises.length,
    totalPrescriptions: prescriptionRows.length,
    nextProgramId, nextExerciseId, nextPrescriptionId,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(JSON_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n✅ Done! Files written to:', OUTPUT_DIR, 'and', JSON_DIR);
  console.log('SQL files:', prescChunkIndex - 1, 'prescription chunks');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
