import fs from 'fs';

const markdown = fs.readFileSync('public/data/leetcode/problems/0003.longest-substring-without-repeating-characters.json', 'utf8');
const data = JSON.parse(markdown);

let detailsMarkdown = data.markdown;

const match = detailsMarkdown.match(/##\s+Solutions?/i);
let descriptionMarkdown = '';
let solutionsMarkdown = '';

if (!match) {
    descriptionMarkdown = detailsMarkdown;
} else {
    const matchIndex = match.index !== undefined ? match.index : 0;
    descriptionMarkdown = detailsMarkdown.substring(0, matchIndex);
    solutionsMarkdown = detailsMarkdown.substring(matchIndex);
}

const ALL_LANGUAGES = ['py', 'java', 'cpp', 'go', 'js', 'ts', 'rs', 'cs', 'kt', 'swift', 'rb'];

const approaches = [];
const sections = solutionsMarkdown.split(/(?=\n###\s+)/);
const sectionsToProcess = sections.length > 1 ? sections.filter(s => s.trim().startsWith('###')) : [solutionsMarkdown];

for (let i = 0; i < sectionsToProcess.length; i++) {
    let section = sectionsToProcess[i].trim();
    let title = "Approach 1";
    
    if (section.startsWith('### ')) {
        const lines = section.split('\n');
        title = lines[0].replace('### ', '').trim();
        section = lines.slice(1).join('\n');
    }
    
    const langSections = section.split(/(?=\n####\s+)/);
    const desc = langSections.length > 0 && !langSections[0].trim().startsWith('####') 
        ? langSections[0].trim() 
        : '';
        
    const solutions = ALL_LANGUAGES.map(lang => {
        const langMarkdownMap = {
            py: ['Python3', 'Python'],
            js: ['JavaScript'],
            ts: ['TypeScript'],
            java: ['Java'],
            cpp: ['C++'],
            go: ['Go'],
            rs: ['Rust'],
            cs: ['C#'],
            kt: ['Kotlin'],
            swift: ['Swift'],
            rb: ['Ruby'],
        };
        
        const targetLabels = langMarkdownMap[lang] || [];
        for (const label of targetLabels) {
            const headerRegex = new RegExp(`####\\s+${label}`, 'i');
            const match = section.match(headerRegex);
            
            if (match && match.index !== undefined) {
                const codeBlockStart = section.indexOf('```', match.index);
                if (codeBlockStart !== -1) {
                    const codeContentStart = section.indexOf('\n', codeBlockStart);
                    if (codeContentStart !== -1) {
                        const codeBlockEnd = section.indexOf('```', codeContentStart + 1);
                        if (codeBlockEnd !== -1) {
                            return {
                                lang,
                                code: section.substring(codeContentStart + 1, codeBlockEnd).trim()
                            };
                        }
                    }
                }
            }
        }
        return null;
    }).filter(Boolean);
    
    if (solutions.length > 0) {
        approaches.push({
            id: `approach-${i}`,
            title,
            description: desc,
            solutions
        });
    }
}

console.log(JSON.stringify(approaches, null, 2));
