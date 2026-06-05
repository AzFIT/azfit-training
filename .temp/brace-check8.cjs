const fs = require('fs');
const c = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let inString = null, inTemplate = false, inComment = false, escape = false;
let line = 1;
for (let i = 0; i < c.length; i++) {
  const ch = c[i];
  const next = c[i+1];
  if (ch === '\n') line++;
  
  if (line === 240 && i > 10330 && i < 10410) {
    console.log('i=', i, 'ch=', JSON.stringify(ch), 'inComment=', inComment, 'inString=', inString);
  }
  
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (inComment) { if (ch === '*' && next === '/') { inComment = false; i++; } continue; }
  if (inString) { if (ch === inString) inString = null; continue; }
  if (inTemplate) { if (ch === '`') inTemplate = false; continue; }
  if (ch === '/' && next === '*') { inComment = true; i++; continue; }
  if (ch === '/' && next === '/') { while (i < c.length && c[i] !== '\n') i++; continue; }
  if (ch === '"' || ch === "'") { inString = ch; continue; }
  if (ch === '`') { inTemplate = true; continue; }
}
