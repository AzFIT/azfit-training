const fs = require('fs');
const readline = require('readline');

async function analyze() {
  const fileStream = fs.createReadStream('programs_detailed_boostcamp_kaggle.csv');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let count = 0;
  const programs = new Set();
  const exercises = new Set();
  const levels = new Set();
  const goals = new Set();
  const equipmentSet = new Set();
  const sampleRows = [];

  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      console.log('Columns:', header);
      continue;
    }
    count++;

    // Parse CSV handling quoted fields
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

    programs.add(cols[0]);
    exercises.add(cols[10]);
    levels.add(cols[2]);
    goals.add(cols[3]);
    equipmentSet.add(cols[4]);

    if (sampleRows.length < 5) {
      sampleRows.push({
        title: cols[0],
        description: cols[1].substring(0, 100),
        level: cols[2],
        goal: cols[3],
        equipment: cols[4],
        program_length: cols[5],
        time_per_workout: cols[6],
        week: cols[7],
        day: cols[8],
        number_of_exercises: cols[9],
        exercise_name: cols[10],
        sets: cols[11],
        reps: cols[12],
        intensity: cols[13]
      });
    }

    if (count >= 100000) break;
  }

  console.log('\n=== SAMPLE ROWS ===');
  sampleRows.forEach((r, i) => console.log(i + 1, JSON.stringify(r, null, 2)));

  console.log('\n=== STATS (from 100k sample) ===');
  console.log('Total rows scanned:', count);
  console.log('Unique programs:', programs.size);
  console.log('Unique exercises:', exercises.size);
  console.log('\nUnique levels:', Array.from(levels).slice(0, 10));
  console.log('\nUnique goals:', Array.from(goals).slice(0, 10));
  console.log('\nUnique equipment:', Array.from(equipmentSet).slice(0, 10));
}

analyze().catch(console.error);
