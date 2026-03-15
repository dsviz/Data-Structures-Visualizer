import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const REPO_URL = 'https://github.com/shubhamkumarsharma03/leetcode.git';
const REPO_DIR = path.join(__dirname, '..', '.leetcode-repo');
const OUT_DIR = path.join(__dirname, '..', 'public', 'data', 'leetcode');
const PROBLEMS_OUT_DIR = path.join(OUT_DIR, 'problems');

// Setup dirs
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
if (!fs.existsSync(PROBLEMS_OUT_DIR)) {
  fs.mkdirSync(PROBLEMS_OUT_DIR, { recursive: true });
}

// Clone repository if not exists
if (!fs.existsSync(REPO_DIR)) {
  console.log(`Cloning ${REPO_URL} into ${REPO_DIR}...`);
  execSync(`git clone --depth 1 ${REPO_URL} ${REPO_DIR}`, { stdio: 'inherit' });
} else {
  console.log(`Repository already exists at ${REPO_DIR}. Pulling latest...`);
  execSync(`git -C ${REPO_DIR} pull`, { stdio: 'inherit' });
}

// Helper types and logic ported from leetcodeRepoService
type LeetcodeDifficulty = 'Easy' | 'Medium' | 'Hard';

interface RepoLeetcodeProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: LeetcodeDifficulty;
  tags: string[];
  topics: string[];
  visualizerPath: string;
  range: string;
  folderName: string;
  detailPath: string;
}

const KEYWORD_TOPIC_RULES = [
  { topic: 'linked-list', keywords: ['linked-list', 'list-node', 'listnode', 'linked'] },
  { topic: 'trees', keywords: ['tree', 'bst', 'binary-tree', 'trie'] },
  { topic: 'graphs', keywords: ['graph', 'topological', 'union-find', 'bfs', 'dfs', 'island'] },
  { topic: 'stack', keywords: ['stack', 'parentheses', 'monotonic'] },
  { topic: 'queue', keywords: ['queue', 'deque', 'sliding-window-maximum'] },
  { topic: 'sorting', keywords: ['sort', 'merge-interval', 'interval', 'quickselect'] },
  { topic: 'recursion', keywords: ['recursion', 'backtracking', 'subsets', 'permutation'] },
  { topic: 'arrays', keywords: ['array', 'matrix', 'sum', 'subarray', 'prefix'] },
];

function normalizeText(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, '-');
}

function parseTopicFromText(values: string[]) {
  const haystack = normalizeText(values.join(' '));
  const topics = new Set<string>();

  for (const rule of KEYWORD_TOPIC_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      topics.add(rule.topic);
    }
  }

  if (topics.size === 0) topics.add('arrays');
  return Array.from(topics);
}

function inferVisualizerPath(topics: string[]) {
  const priority = [
    { topic: 'arrays', path: '/arrays' },
    { topic: 'linked-list', path: '/linked-list' },
    { topic: 'stack', path: '/stack' },
    { topic: 'queue', path: '/queue' },
    { topic: 'trees', path: '/trees' },
    { topic: 'graphs', path: '/graphs' },
    { topic: 'sorting', path: '/sorting' },
    { topic: 'recursion', path: '/recursion' },
  ];

  for (const item of priority) {
    if (topics.includes(item.topic)) return item.path;
  }
  return '/arrays';
}

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { tags: [] };

  const body = match[1];
  const difficultyMatch = body.match(/difficulty:\s*(Easy|Medium|Hard)/i);
  const tagsBlockMatch = body.match(/tags:\s*\n([\s\S]*?)(?=\n\w|$)/i);
  const tags = tagsBlockMatch
    ? Array.from(tagsBlockMatch[1].matchAll(/-\s+(.+)/g)).map((entry) => entry[1].trim())
    : [];

  const difficulty = difficultyMatch
    ? (difficultyMatch[1][0].toUpperCase() + difficultyMatch[1].slice(1).toLowerCase()) as LeetcodeDifficulty
    : undefined;

  return { difficulty, tags };
}

function getTitleFromMarkdown(markdown: string, fallback: string) {
  const match = markdown.match(/^#\s+\[(.+?)\]\(.+?\)/m) || markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function decodeHtmlEntities(text: string) {
  const entities: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#39;': "'",
  };
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
  return result;
}

function cleanMarkdown(markdown: string) {
  return decodeHtmlEntities(
    markdown
      .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '')
      .replace(/<!--\s*problem:start\s*-->/g, '')
      .replace(/<!--\s*problem:end\s*-->/g, '')
      .replace(/<!--\s*description:start\s*-->/g, '')
      .replace(/<!--\s*description:end\s*-->/g, '')
      .replace(/<!--\s*solution:start\s*-->/g, '')
      .replace(/<!--\s*solution:end\s*-->/g, '')
      .replace(/<!--\s*tabs:start\s*-->/g, '')
      .replace(/<!--\s*tabs:end\s*-->/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

// Main logic
async function run() {
  const solutionsDir = path.join(REPO_DIR, 'solutions');
  if (!fs.existsSync(solutionsDir)) {
    console.error('Solutions directory not found in repository!');
    process.exit(1);
  }

  const rangeDirs = fs.readdirSync(solutionsDir).filter((d) => /\d{4}-\d{4}/.test(d));
  const problemsFiles: { id: number; markdownPath: string; folderName: string; range: string; slug: string }[] = [];

  for (const range of rangeDirs) {
    const rangePath = path.join(solutionsDir, range);
    if (!fs.statSync(rangePath).isDirectory()) continue;

    const problemDirs = fs.readdirSync(rangePath);
    for (const pDir of problemDirs) {
      const pPath = path.join(rangePath, pDir);
      if (!fs.statSync(pPath).isDirectory()) continue;

      const readmePath = path.join(pPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        const match = pDir.match(/^(\d{4})\.(.+)$/);
        if (match) {
          problemsFiles.push({
            id: Number(match[1]),
            markdownPath: readmePath,
            folderName: pDir,
            range,
            slug: match[2],
          });
        }
      }
    }
  }

  problemsFiles.sort((a, b) => a.id - b.id);
  console.log(`Found ${problemsFiles.length} problems.`);

  // Setup batching
  const args = process.argv.slice(2);
  let batchIndex = 0;
  let BATCH_SIZE = problemsFiles.length; // Default to all

  const batchArgIndex = args.indexOf('--batch');
  if (batchArgIndex !== -1 && args[batchArgIndex + 1]) {
    batchIndex = parseInt(args[batchArgIndex + 1], 10) - 1; // 1-indexed to 0-indexed
    BATCH_SIZE = 500;
  }

  const catalog: RepoLeetcodeProblem[] = [];
  const startIndex = batchIndex * BATCH_SIZE;
  const endIndex = Math.min(startIndex + BATCH_SIZE, problemsFiles.length);

  // If a batch is specified, we still want to read all frontmatters to generate a COMPLETE catalog.json
  // Because catalog.json powers the list UI. But we only write problem JSON files for the specified batch.
  // Actually, catalog generation is fast. Let's build full catalog always.
  console.log(`Building full catalog...`);
  for (const p of problemsFiles) {
    const markdown = fs.readFileSync(p.markdownPath, 'utf8');
    const frontmatter = parseFrontmatter(markdown);
    const title = getTitleFromMarkdown(markdown, p.slug.split('-').join(' '));
    const topics = parseTopicFromText([p.slug, ...frontmatter.tags]);

    catalog.push({
      id: p.id,
      title,
      slug: p.slug,
      difficulty: frontmatter.difficulty || 'Medium',
      tags: frontmatter.tags,
      topics,
      visualizerPath: inferVisualizerPath(topics),
      range: p.range,
      folderName: p.folderName,
      detailPath: `/leetcode/problem/${String(p.id).padStart(4, '0')}.${p.slug}`
    });
  }

  // Write catalog (only on batch 1 or no batch, to avoid rewriting unnecessarily if parallelized)
  if (batchIndex === 0) {
    const catalogPath = path.join(OUT_DIR, 'catalog.json');
    fs.writeFileSync(catalogPath, JSON.stringify({ success: true, count: catalog.length, problems: catalog }));
    console.log(`Wrote full catalog to ${catalogPath}`);
  }

  // Write problems for batch
  if (startIndex >= problemsFiles.length) {
    console.log(`Batch ${batchIndex + 1} is out of bounds (max ${problemsFiles.length} items). Exiting.`);
    process.exit(0);
  }

  console.log(`Processing batch ${batchIndex + 1}: Items ${startIndex} to ${endIndex - 1}`);
  let count = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const p = problemsFiles[i];
    const markdown = fs.readFileSync(p.markdownPath, 'utf8');
    const catalogEntry = catalog[i];
    
    const problemData = {
      title: catalogEntry.title,
      difficulty: catalogEntry.difficulty,
      tags: catalogEntry.tags,
      markdown: cleanMarkdown(markdown)
    };

    const outPath = path.join(PROBLEMS_OUT_DIR, `${p.folderName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(problemData));
    count++;
  }

  console.log(`Wrote ${count} problem files to ${PROBLEMS_OUT_DIR}`);
}

run().catch((err) => {
  console.error('Error generating data:', err);
  process.exit(1);
});
