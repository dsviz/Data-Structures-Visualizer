import {
  LeetcodeDifficulty,
  LeetcodeProblem,
  LEETCODE_PROBLEMS,
  DS_TO_TOPIC,
} from '../data/LeetcodeProblems';

const OWNER = 'shubhamkumarsharma03';
const REPO = 'leetcode';
const BRANCH = 'master';

// Local static data URLs generated during build
const TREE_API = `/data/leetcode/catalog.json`;
const RAW_BASE = `/data/leetcode/problems`;

const CACHE_KEY = 'leetcode_repo_catalog_v2';
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

// The React client now just consumes the precalculated values without blocking the main thread.
// We also use local overrides from LeetcodeProblems.ts for curated problems.

const CURATED_TOPIC_MAP = new Map<number, any>(
  LEETCODE_PROBLEMS.map(p => [p.id, { topics: p.topics, visualizerPath: p.visualizerPath }])
);


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

function enrichProblemsWithMetadata(serverProblems: any[]): RepoLeetcodeProblem[] {
  return serverProblems.map(sp => {
    const curated = CURATED_TOPIC_MAP.get(sp.id);
    const tags = sp.tags || [];
    
    // Auto-identify topics from tags if not provided by server or curated list
    let topics = sp.topics || curated?.topics;
    
    if (!topics || topics.length === 0 || (topics.length === 1 && topics[0] === 'arrays')) {
      const identifiedTopics = new Set<string>();
      tags.forEach((tag: string) => {
        // Normalize tag for matching (Title Case)
        const normalizedTag = tag.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        
        // Direct map from DS_TO_TOPIC
        if (DS_TO_TOPIC[normalizedTag]) {
          identifiedTopics.add(DS_TO_TOPIC[normalizedTag]);
        }
        
        // Common aliases and case-insensitive checks
        const upperTag = tag.toUpperCase();
        if (upperTag === 'DP' || upperTag.includes('DYNAMIC PROGRAMMING')) identifiedTopics.add('dynamic-programming');
        if (upperTag.includes('RECURSION')) identifiedTopics.add('recursion');
        if (upperTag.includes('BACKTRACKING')) identifiedTopics.add('backtracking');
        if (upperTag.includes('PRIORITY QUEUE') || upperTag.includes('HEAP')) identifiedTopics.add('heap');
        if (upperTag.includes('HASH TABLE') || upperTag.includes('HASH MAP')) identifiedTopics.add('hash-table');
        if (upperTag.includes('SORT')) identifiedTopics.add('sorting');
      });

      if (identifiedTopics.size > 0) {
        topics = Array.from(identifiedTopics);
      }
    }

    if (!topics || topics.length === 0) topics = ['arrays'];

    const idStr = String(sp.id).padStart(4, '0');
    return {
      id: sp.id,
      slug: sp.slug,
      title: sp.title || sp.slug,
      difficulty: sp.difficulty || 'Medium',
      tags: tags,
      topics: topics,
      visualizerPath: curated?.visualizerPath || (topics.includes('arrays') ? '/arrays' : undefined),
      range: sp.range,
      folderName: sp.folderName || `${idStr}.${sp.slug}`,
      readmeUrl: `${RAW_BASE}/${sp.folderName || `${idStr}.${sp.slug}`}`,
      githubFolderUrl: `https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/solutions/${sp.range}/${sp.folderName || `${idStr}.${sp.slug}`}`,
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
