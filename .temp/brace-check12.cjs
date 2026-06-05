const fs = require('fs');
const c = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
let line = 1;
for (let i = 0; i < c.length; i++) {
  if (c[i] === '\n') {
    line++;
    if (line >= 237 && line <= 243) {
      console.log('newline at', i, 'line now', line);
    }
  }
  if (i === 10402) {
    console.log('AT 10402: line=', line);
  }
}
