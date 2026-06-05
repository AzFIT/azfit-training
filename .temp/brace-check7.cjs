const fs = require('fs');
const content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const chars = content.split('');
let inString = null;
let inTemplate = false;
let inComment = false;
let escape = false;
let line = 1;

for (let i = 0; i < chars.length; i++) {
  const c = chars[i];
  const next = chars[i+1];
  
  if (c === '\n') {
    line++;
    continue;
  }
  
  if (line === 240 && i > 10400) {
    console.log(`i=${i}, c='${c}', next='${next}', inComment=${inComment}, inString=${inString}`);
  }
  
  if (escape) {
    escape = false;
    continue;
  }
  
  if (c === '\\') {
    escape = true;
    continue;
  }
  
  if (inComment) {
    if (c === '*' && next === '/') {
      inComment = false;
      i++;
      if (line === 240) console.log(`  -> comment ended, i now ${i}, next char '${chars[i+1]}'`);
    }
    continue;
  }
  
  if (inString) {
    if (c === inString) {
      inString = null;
    }
    continue;
  }
  
  if (inTemplate) {
    if (c === '`') {
      inTemplate = false;
    }
    continue;
  }
  
  if (c === '/' && next === '*') {
    inComment = true;
    i++;
    if (line === 240) console.log(`  -> comment started`);
    continue;
  }
  
  if (c === '/' && next === '/') {
    while (i < chars.length && chars[i] !== '\n') i++;
    continue;
  }
  
  if (c === '"' || c === "'") {
    inString = c;
    continue;
  }
  
  if (c === '`') {
    inTemplate = true;
    continue;
  }
  
  if ((c === '{' || c === '}') && line === 240) {
    console.log(`  -> ${c} counted!`);
  }
}
