const fs = require('fs');
const c = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let line = 1;
for (let i = 0; i < c.length; i++) {
  if (c[i] === '\n') line++;
  if (i >= 10330 && i <= 10410) {
    console.log('i=', i, 'ch=', JSON.stringify(c[i]), 'line=', line);
  }
}
