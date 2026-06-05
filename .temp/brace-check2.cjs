const fs = require('fs');
const content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let depth = 0;
let inString = null;
let inTemplate = false;
let inComment = false;
let escape = false;
let line = 1;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const next = content[i+1];
  
  if (c === '\n') line++;
  
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
    continue;
  }
  
  if (c === '/' && next === '/') {
    while (i < content.length && content[i] !== '\n') i++;
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
    if (depth > 5) console.log(`Line ${line}: depth increased to ${depth}`);
  }
  if (c === '}') {
    depth--;
    if (depth < 0) {
      console.log(`Line ${line}: ERROR depth went negative to ${depth}`);
      depth = 0;
    }
  }
}

console.log('Final depth:', depth);
