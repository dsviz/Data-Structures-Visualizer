import {
  LEETCODE_PROBLEMS,
  LeetcodeDifficulty,
  LeetcodeProblem,
  LeetcodeTopic,
  TOPIC_LABELS,
} from '../data/LeetcodeProblems';

const OWNER = 'shubhamkumarsharma03';
const REPO = 'leetcode';
const BRANCH = 'master';

// Use server-side proxy for GitHub API calls to avoid rate limits
// Smart URL detection: Render for production, localhost for development
const getApiBaseUrl = (): string => {
  // First: Check for runtime override
  if (typeof window !== 'undefined' && (window as any).__API_BASE__) {
    return (window as any).__API_BASE__;
  }
  
  // Second: Check for env var (can be set in .env file)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Third: Smart detection based on hostname
  if (typeof window !== 'undefined') {
    // If we're on GitHub Pages (not localhost), use Render backend
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://dsviz.onrender.com';
    }
  }
  
  // Default: localhost for development
  return 'http://localhost:3002';
};

const API_BASE = getApiBaseUrl();
const TREE_API = `${API_BASE}/api/leetcode/catalog`;
const RAW_BASE = `${API_BASE}/api/leetcode/readme`;

const CACHE_KEY = 'leetcode_repo_catalog_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

export interface RepoLeetcodeProblem extends LeetcodeProblem {
  range: string;
  folderName: string;
  readmeUrl: string;
  githubFolderUrl: string;
  detailPath: string;
}

export interface RepoReadmeDetails {
  title: string;
  difficulty: LeetcodeDifficulty;
  tags: string[];
  markdown: string;
}

let inMemoryProblems: RepoLeetcodeProblem[] | null = null;
let inFlightProblems: Promise<RepoLeetcodeProblem[]> | null = null;

const KEYWORD_TOPIC_RULES: Array<{ topic: LeetcodeTopic; keywords: string[] }> = [
  { topic: 'linked-list', keywords: ['linked-list', 'list-node', 'listnode', 'linked'] },
  { topic: 'trees', keywords: ['tree', 'bst', 'binary-tree', 'trie'] },
  { topic: 'graphs', keywords: ['graph', 'topological', 'union-find', 'bfs', 'dfs', 'island'] },
  { topic: 'stack', keywords: ['stack', 'parentheses', 'monotonic'] },
  { topic: 'queue', keywords: ['queue', 'deque', 'sliding-window-maximum'] },
  { topic: 'sorting', keywords: ['sort', 'merge-interval', 'interval', 'quickselect'] },
  { topic: 'recursion', keywords: ['recursion', 'backtracking', 'subsets', 'permutation'] },
  { topic: 'arrays', keywords: ['array', 'matrix', 'sum', 'subarray', 'prefix'] },
];

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '-');
}

function parseTopicFromText(values: string[]): LeetcodeTopic[] {
  const haystack = normalizeText(values.join(' '));
  const topics = new Set<LeetcodeTopic>();

  for (const rule of KEYWORD_TOPIC_RULES) {
    if (rule.keywords.some(keyword => haystack.includes(keyword))) {
      topics.add(rule.topic);
    }
  }

  if (topics.size === 0) topics.add('arrays');
  return Array.from(topics);
}

function inferVisualizerPath(topics: LeetcodeTopic[]): string | undefined {
  const priority: Array<{ topic: LeetcodeTopic; path: string }> = [
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

function parseFrontmatter(markdown: string): { difficulty?: LeetcodeDifficulty; tags: string[] } {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { tags: [] };

  const body = match[1];
  const difficultyMatch = body.match(/difficulty:\s*(Easy|Medium|Hard)/i);
  const tagsBlockMatch = body.match(/tags:\s*\n([\s\S]*?)(?=\n\w|$)/i);
  const tags = tagsBlockMatch
    ? Array.from(tagsBlockMatch[1].matchAll(/-\s+(.+)/g)).map(entry => entry[1].trim())
    : [];

  const difficulty = difficultyMatch
    ? (difficultyMatch[1][0].toUpperCase() + difficultyMatch[1].slice(1).toLowerCase()) as LeetcodeDifficulty
    : undefined;

  return { difficulty, tags };
}

function getTitleFromMarkdown(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+\[(.+?)\]\(.+?\)/m) || markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function decodeHtmlEntities(text: string): string {
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
  // Replace named entities
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  
  // Replace numeric entities (&#123; and &#x1a;)
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
  
  return result;
}

function cleanMarkdown(markdown: string): string {
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

function getDetailPath(id: number, slug: string): string {
  return `/leetcode/problem/${String(id).padStart(4, '0')}.${slug}`;
}

function getVisualizationPath(id: number, slug: string): string {
  return `/leetcode/visualize/${String(id).padStart(4, '0')}.${slug}`;
}

export function getProblemDetailPath(problem: Pick<RepoLeetcodeProblem, 'id' | 'slug'>): string {
  return getDetailPath(problem.id, problem.slug);
}

export function getProblemVisualizationPath(problem: Pick<RepoLeetcodeProblem, 'id' | 'slug'>): string {
  return getVisualizationPath(problem.id, problem.slug);
}

function parseTreeToProblems(paths: string[]): RepoLeetcodeProblem[] {
  const staticById = new Map<number, LeetcodeProblem>(LEETCODE_PROBLEMS.map(p => [p.id, p]));
  const unique = new Map<number, RepoLeetcodeProblem>();

  for (const path of paths) {
    const match = path.match(/^solutions\/(\d{4}-\d{4})\/(\d{4})\.([^/]+)\/README\.md$/);
    if (!match) continue;

    const [, range, idRaw, slug] = match;
    const id = Number(idRaw);
    if (!Number.isFinite(id)) continue;
    if (unique.has(id)) continue;

    const baseMeta = staticById.get(id);
    const fallbackTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const topicSource = [slug, ...(baseMeta?.tags ?? []), ...(baseMeta?.topics ?? []).map(t => TOPIC_LABELS[t])];
    const topics = baseMeta?.topics?.length ? baseMeta.topics : parseTopicFromText(topicSource);

    const problem: RepoLeetcodeProblem = {
      id,
      slug,
      title: baseMeta?.title || fallbackTitle,
      difficulty: baseMeta?.difficulty || 'Medium',
      tags: baseMeta?.tags || [],
      topics,
      visualizerPath: baseMeta?.visualizerPath || inferVisualizerPath(topics),
      range,
      folderName: `${idRaw}.${slug}`,
      readmeUrl: `${RAW_BASE}/solutions/${range}/${idRaw}.${slug}/README.md`,
      githubFolderUrl: `https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/solutions/${range}/${idRaw}.${slug}`,
      detailPath: getDetailPath(id, slug),
    };

    unique.set(id, problem);
  }

  return Array.from(unique.values()).sort((a, b) => a.id - b.id);
}

function readCachedProblems(): RepoLeetcodeProblem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { createdAt: number; problems: RepoLeetcodeProblem[] };
    if (!parsed.createdAt || !Array.isArray(parsed.problems)) return null;
    if (Date.now() - parsed.createdAt > CACHE_TTL_MS) return null;
    return parsed.problems;
  } catch {
    return null;
  }
}

function writeCachedProblems(problems: RepoLeetcodeProblem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ createdAt: Date.now(), problems }));
  } catch {
    // Ignore storage errors (private mode / quota)
  }
}

export async function fetchAllLeetcodeRepoProblems(forceRefresh = false): Promise<RepoLeetcodeProblem[]> {
  if (!forceRefresh && inMemoryProblems) return inMemoryProblems;

  if (!forceRefresh) {
    const cached = readCachedProblems();
    if (cached && cached.length > 0) {
      inMemoryProblems = cached;
      return cached;
    }
  }

  if (inFlightProblems && !forceRefresh) return inFlightProblems;

  inFlightProblems = (async () => {
    try {
      // Try server proxy first (with caching)
      const res = await fetch(TREE_API);
      if (!res.ok) throw new Error(`Unable to fetch from server (${res.status})`);
      
      const data = await res.json() as { 
        success?: boolean; 
        problems?: Array<{ id: number; slug: string; difficulty?: string; tags?: string[] }>;
        count?: number;
      };

      if (data.success && data.problems && Array.isArray(data.problems)) {
        // Server returned pre-parsed problems
        const problems = enrichProblemsWithMetadata(data.problems);
        inMemoryProblems = problems;
        writeCachedProblems(problems);
        return problems;
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (serverError) {
      console.warn('[LeetCode Service] Server proxy failed, falling back to GitHub direct:', serverError);
      
      // Fallback to direct GitHub API
      const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`);
      if (!res.ok) throw new Error(`Unable to fetch repo tree (${res.status})`);
      const data = await res.json() as { tree?: Array<{ path: string; type: string }> };

      const readmePaths = (data.tree || [])
        .filter(item => item.type === 'blob' && item.path.endsWith('/README.md'))
        .map(item => item.path);

      const problems = parseTreeToProblems(readmePaths);
      inMemoryProblems = problems;
      writeCachedProblems(problems);
      return problems;
    }
  })();

  try {
    return await inFlightProblems;
  } finally {
    inFlightProblems = null;
  }
}

function enrichProblemsWithMetadata(serverProblems: Array<{ id: number; slug: string; difficulty?: string; tags?: string[] }>): RepoLeetcodeProblem[] {
  const staticById = new Map<number, LeetcodeProblem>(LEETCODE_PROBLEMS.map(p => [p.id, p]));
  
  return serverProblems.map(sp => {
    const baseMeta = staticById.get(sp.id);
    const fallbackTitle = sp.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const topicSource = [sp.slug, ...(baseMeta?.tags ?? []), ...(baseMeta?.topics ?? []).map(t => TOPIC_LABELS[t])];
    const topics = baseMeta?.topics?.length ? baseMeta.topics : parseTopicFromText(topicSource);
    
    const range = `${String(Math.floor(sp.id / 100) * 100).padStart(4, '0')}-${String(Math.floor(sp.id / 100) * 100 + 99).padStart(4, '0')}`;
    const idStr = String(sp.id).padStart(4, '0');

    return {
      id: sp.id,
      slug: sp.slug,
      title: baseMeta?.title || fallbackTitle,
      difficulty: (sp.difficulty as LeetcodeDifficulty) || baseMeta?.difficulty || 'Medium',
      tags: sp.tags && sp.tags.length > 0 ? sp.tags : baseMeta?.tags || [],
      topics,
      visualizerPath: baseMeta?.visualizerPath || inferVisualizerPath(topics),
      range,
      folderName: `${idStr}.${sp.slug}`,
      readmeUrl: `${RAW_BASE}/${idStr}.${sp.slug}`,
      githubFolderUrl: `https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/solutions/${range}/${idStr}.${sp.slug}`,
      detailPath: getDetailPath(sp.id, sp.slug),
    };
  }).sort((a, b) => a.id - b.id);
}

export async function fetchLeetcodeReadmeDetails(problem: RepoLeetcodeProblem): Promise<RepoReadmeDetails> {
  try {
    // Try server proxy first
    const problemKey = `${String(problem.id).padStart(4, '0')}.${problem.slug}`;
    const res = await fetch(`${RAW_BASE}/${problemKey}`);
    
    if (!res.ok) throw new Error(`Unable to fetch README (${res.status})`);

    const data = await res.json() as { content?: string; success?: boolean };
    
    if (!data.success || !data.content) {
      throw new Error('Invalid server response');
    }

    const markdown = data.content;
    const frontmatter = parseFrontmatter(markdown);

    return {
      title: getTitleFromMarkdown(markdown, problem.title),
      difficulty: frontmatter.difficulty || problem.difficulty,
      tags: frontmatter.tags.length > 0 ? frontmatter.tags : problem.tags,
      markdown: cleanMarkdown(markdown),
    };
  } catch (serverError) {
    console.warn('[LeetCode Service] Server README fetch failed, falling back to GitHub direct:', serverError);
    
    // Fallback to direct GitHub
    const res = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/solutions/${problem.range}/${problem.folderName}/README.md`
    );
    if (!res.ok) throw new Error(`Unable to fetch README (${res.status})`);

    const markdown = await res.text();
    const frontmatter = parseFrontmatter(markdown);

    return {
      title: getTitleFromMarkdown(markdown, problem.title),
      difficulty: frontmatter.difficulty || problem.difficulty,
      tags: frontmatter.tags.length > 0 ? frontmatter.tags : problem.tags,
      markdown: cleanMarkdown(markdown),
    };
  }
}
