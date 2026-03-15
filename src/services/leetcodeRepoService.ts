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

// Local static data URLs generated during build
const TREE_API = `/data/leetcode/catalog.json`;
const RAW_BASE = `/data/leetcode/problems`;

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
      console.warn('[LeetCode Service] Failed to load static local catalog:', serverError);
      throw new Error('Unable to load LeetCode problem catalog. Try reloading.');
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
    // Try local static JSON first
    const problemKey = `${String(problem.id).padStart(4, '0')}.${problem.slug}`;
    const res = await fetch(`${RAW_BASE}/${problemKey}.json`);
    
    if (!res.ok) throw new Error(`Unable to fetch local problem JSON (${res.status})`);

    const data = await res.json() as RepoReadmeDetails;
    return data;
  } catch (serverError) {
    console.warn('[LeetCode Service] Failed to load local problem JSON:', serverError);
    throw new Error('Problem data not found.');
  }
}
