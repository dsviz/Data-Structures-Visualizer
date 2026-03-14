const fs = require('fs');
const path = process.argv[2];
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
const stack = [];
const openRe = /<div(?!\s*\/)([^>]*)>/g;
const closeRe = /<\/div>/g;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  openRe.lastIndex = 0;
  while ((m = openRe.exec(line))) {
    stack.push({ line: i + 1, text: m[0] });
  }
  closeRe.lastIndex = 0;
  while ((m = closeRe.exec(line))) {
    if (stack.length > 0) stack.pop();
    else console.log('Extra close at', i + 1);
  }
}
console.log('Unclosed divs:', stack.length);
stack.slice(-10).forEach(s => console.log('  unclosed at line', s.line, s.text));
