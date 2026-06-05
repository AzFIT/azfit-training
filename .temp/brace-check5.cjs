const fs = require('fs');
const content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const lines = content.split('\n');
const line240 = lines[239]; // 0-indexed
console.log('Line 240 length:', line240.length);
console.log('Line 240:', JSON.stringify(line240));

let depth = 0;
let inString = null;
let inTemplate = false;
let inComment = false;
let escape = false;

for (let i = 0; i < line240.length; i++) {
  const c = line240[i];
  const next = line240[i+1];
  
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
      console.log(`After comment end at i=${i}: next char will be '${line240[i+1]}'`);
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
    console.log(`Comment started at i=${i}`);
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
  
  if (c === '{') {
    depth++;
    console.log(`{ at i=${i}, depth=${depth}`);
  }
  if (c === '}') {
    depth--;
    console.log(`} at i=${i}, depth=${depth}`);
  }
}

console.log('Final depth for line 240:', depth);
