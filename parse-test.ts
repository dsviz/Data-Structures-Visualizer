import * as fs from 'fs';

const jsonStr = fs.readFileSync('public/data/leetcode/problems/0001.two-sum.json', 'utf8');
const data = JSON.parse(jsonStr);
let raw = data.markdown.substring(data.markdown.indexOf('## Solutions'));

console.log('Total length:', raw.length);

const approaches: any[] = [];
// Split by `### `
const sections = raw.split(/(?=###\s+)/);

for (const section of sections) {
  if (section.trim().startsWith('### ')) {
    const lines = section.split('\n');
    const title = lines[0].replace('### ', '').trim();
    const content = lines.slice(1).join('\n');
    
    const langSections = content.split(/(?=####\s+)/);
    const desc = langSections[0].trim();
    const langs = langSections.slice(1).map(l => {
      const llines = l.split('\n');
      const ltitle = llines[0].replace('#### ', '').trim();
      const codeMatch = l.match(/```(\w*)\n([\s\S]*?)```/);
      return {
        title: ltitle,
        langCode: codeMatch ? codeMatch[1] : '',
        code: codeMatch ? codeMatch[2].trim() : ''
      };
    });
    
    approaches.push({ title, desc, langs });
  }
}

console.log(JSON.stringify(approaches, null, 2));
