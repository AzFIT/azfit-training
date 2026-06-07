const fs = require('fs');
const path = require('path');

const REPLACEMENTS = {
  '#6B7280': 'gray-550',
  '#F5F7FA': 'off-white',
  '#F8F9FA': 'off-white-2',
  '#DC2626': 'danger',
  '#6366F1': 'indigo',
  '#06B6D4': 'teal',
  '#CA8A04': 'amber',
  '#C084FC': 'violet-light',
  '#6D28D9': 'violet-dark',
  '#16A34A': 'emerald',
  '#E5E7EB': 'gray-200',
  '#CBD5E1': 'gray-300',
  '#4B5563': 'gray-650',
  '#EA580C': 'rose',
  '#DB2777': 'pink',
  '#D97706': 'amber-light',
  '#D1D5DB': 'gray-300',
  '#9CA3AF': 'gray-400',
  '#7C4FE4': 'violet',
  '#555': 'gray-600',
  '#374151': 'gray-750',
  '#33BEF2': 'cyan-light',
  '#1F2937': 'gray-850',
  '#1EAD4E': 'success',
  '#111827': 'gray-950',
  '#10B981': 'emerald-light',
  '#0F0F0F': 'az-black',
  '#0077B6': 'blue-ocean',
};

function shouldSkip(dirPath) {
  const normalized = dirPath.replace(/\\/g, '/');
  return normalized.includes('/ui/') || normalized.includes('/landing/');
}

function processDir(dir) {
  let changed = 0;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (!shouldSkip(p)) {
        changed += processDir(p);
      }
    } else if (f.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      const original = content;
      for (const [old, nw] of Object.entries(REPLACEMENTS)) {
        content = content.split(old).join(nw);
      }
      if (content !== original) {
        fs.writeFileSync(p, content, 'utf8');
        changed++;
      }
    }
  }
  return changed;
}

const pagesChanged = processDir('src/pages');
const compChanged = processDir('src/components');
console.log('Files changed: pages=' + pagesChanged + ', components=' + compChanged);
