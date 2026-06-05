const fs = require('fs');
const content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const chars = content.split('');
let depth = 0;
let inString = null;
let inTemplate = false;
let inComment = false;
let escape = false;
let line = 1;
const stack = [];

for (let i = 0; i < chars.length; i++) {
  const c = chars[i];
  const next = chars[i+1];
  
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
  
  if (c === '{') {
    depth++;
    stack.push(line);
  }
  if (c === '}') {
    if (stack.length === 0) {
      console.log(`Line ${line}: EXTRA closing brace`);
    } else {
      stack.pop();
      depth--;
    }
  }
}

console.log('Final depth:', depth);
console.log('Unmatched opens at lines:', stack);
