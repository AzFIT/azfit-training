const fs = require('fs');
const c = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let inString = null, inTemplate = false, inComment = false, escape = false;
let line = 1;
const stack = [];

for (let i = 0; i < c.length; i++) {
  const ch = c[i];
  const next = c[i+1];
  if (ch === '\n') line++;
  
  if (i === 10402) {
    console.log('AT 10402 BEFORE CHECKS:', 'ch=', JSON.stringify(ch), 'line=', line, 'esc=', escape, 'com=', inComment, 'str=', inString);
  }
  
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (inComment) { 
    if (i === 10402) console.log('  inComment branch');
    if (ch === '*' && next === '/') { inComment = false; i++; } 
    continue; 
  }
  if (inString) { if (ch === inString) inString = null; continue; }
  if (inTemplate) { if (ch === '`') inTemplate = false; continue; }
  if (ch === '/' && next === '*') { inComment = true; i++; continue; }
  if (ch === '/' && next === '/') { while (i < c.length && c[i] !== '\n') i++; continue; }
  if (ch === '"' || ch === "'") { inString = ch; continue; }
  if (ch === '`') { inTemplate = true; continue; }
  
  if (i === 10402) {
    console.log('AT 10402 AFTER CHECKS:', 'ch=', JSON.stringify(ch), 'line=', line);
    if (ch === '}') {
      const popped = stack.pop();
      console.log('  POPPED:', popped);
    }
  }
  
  if (ch === '{') { stack.push(line); }
  if (ch === '}') { stack.pop(); }
}

console.log('Final stack:', stack);
