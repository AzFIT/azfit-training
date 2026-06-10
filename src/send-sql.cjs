const fs = require('fs');
const sql = fs.readFileSync('src/workout_results.sql', 'utf8');

// Escape for JavaScript string literal
const jsSql = sql
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/\n/g, '\\n');

const code = "document.execCommand('insertText', false, '" + jsSql + "')";
const payload = JSON.stringify({action: 'evaluate', args: {code}});

const http = require('http');
const req = http.request({
  hostname: '127.0.0.1',
  port: 10086,
  path: '/command',
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.write(payload);
req.end();
