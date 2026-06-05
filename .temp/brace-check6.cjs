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
    if (line === 240) {
      console.log(`Pushed line 240 at i=${i}, depth=${depth}, stack=${stack.slice(-3)}`);
    }
  }
  if (c === '}') {
    const popped = stack.pop();
    depth--;
    if (line === 240 || popped === 240) {
      console.log(`Popped ${popped} at line ${line}, i=${i}, depth=${depth}, stack=${stack.slice(-3)}`);
    }
  }
}

console.log('Final depth:', depth);
console.log('Unmatched opens at lines:', stack);
