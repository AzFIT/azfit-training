const fs = require('fs');
const content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let depth = 0;
let inString = null;
let inTemplate = false;
let inComment = false;
let escape = false;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const next = content[i+1];
  
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
  
  if (c === '{') depth++;
  if (c === '}') depth--;
}

console.log('Final depth:', depth);
console.log('In string:', inString);
console.log('In template:', inTemplate);
console.log('In comment:', inComment);
