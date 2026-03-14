import { RepoLeetcodeProblem, RepoReadmeDetails } from './leetcodeRepoService';

export interface ProblemExample {
  label: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface CodeLine {
  number: number;
  text: string;
}

export type AlgorithmFamily =
  | 'sliding-window'
  | 'two-pointers'
  | 'binary-search'
  | 'sorting'
  | 'stack'
  | 'queue-bfs'
  | 'graph-traversal'
  | 'tree-traversal'
  | 'recursion-dfs'
  | 'prefix-sum'
  | 'hash-frequency'
  | 'dynamic-programming'
  | 'generic-sequence';

export type VisualKind = 'sequence' | 'linked-list' | 'stack' | 'queue' | 'tree' | 'graph' | 'recursion' | 'grid';

export interface VisualNode {
  id: string;
  label: string;
  active?: boolean;
  accent?: boolean;
  muted?: boolean;
}

export interface VisualEdge {
  from: string;
  to: string;
  active?: boolean;
}

export interface ExecutionVariable {
  key: string;
  value: string;
  tone?: 'primary' | 'accent' | 'muted';
}

export interface ExecutionStep {
  id: number;
  lineNumber: number;
  title: string;
  detail: string;
  stateLabel: string;
  family: AlgorithmFamily;
  kind: VisualKind;
  summary?: string;
  variables?: ExecutionVariable[];
  sequence?: VisualNode[];
  pointers?: Array<{ key: string; index: number; color: string }>;
  callStack?: string[];
  linkedList?: VisualNode[];
  treeLevels?: VisualNode[][];
  graphNodes?: Array<VisualNode & { x: number; y: number }>;
  graphEdges?: VisualEdge[];
  grid?: string[][];
}

export type ExecutionSource = 'specific' | 'family';
export type ExecutionConfidence = 'high' | 'medium' | 'low';

export interface ExecutionPlan {
  steps: ExecutionStep[];
  source: ExecutionSource;
  confidence: ExecutionConfidence;
  executorId?: string;
}

interface ParsedExampleData {
  stringTokens: string[];
  arrayTokens: string[];
  numericTokens: number[];
  target?: number;
}

interface ProblemExecutor {
  id: string;
  matches: (problem: RepoLeetcodeProblem, details: RepoReadmeDetails) => boolean;
  build: (problem: RepoLeetcodeProblem, details: RepoReadmeDetails, example: ProblemExample | undefined, codeLines: CodeLine[]) => ExecutionStep[];
}

function matchesSlug(problem: RepoLeetcodeProblem, slugs: string[]): boolean {
  return slugs.includes(problem.slug);
}

function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/pre>/gi, '\n\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseExamples(markdown: string): ProblemExample[] {
  const text = stripHtml(markdown);
  const regex = /Example\s+(\d+):([\s\S]*?)(?=Example\s+\d+:|Constraints:|$)/gi;
  const results: ProblemExample[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const block = match[2].trim();
    const inputMatch = block.match(/Input:\s*([\s\S]*?)(?=Output:|$)/i);
    const outputMatch = block.match(/Output:\s*([\s\S]*?)(?=Explanation:|$)/i);
    const explanationMatch = block.match(/Explanation:\s*([\s\S]*?)$/i);

    results.push({
      label: `Example ${match[1]}`,
      input: inputMatch?.[1]?.replace(/\s+/g, ' ').trim() || 'Input not provided',
      output: outputMatch?.[1]?.replace(/\s+/g, ' ').trim() || 'Output not provided',
      explanation: explanationMatch?.[1]?.replace(/\s+/g, ' ').trim(),
    });
  }

  return results;
}

export function parseConstraints(markdown: string): string[] {
  const text = stripHtml(markdown);
  const match = text.match(/Constraints:\s*([\s\S]*?)$/i);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function extractCodeLines(code: string): CodeLine[] {
  return code
    .split('\n')
    .map((text, index) => ({ number: index + 1, text }))
    .filter(line => line.text.trim().length > 0)
    .slice(0, 120);
}

function parseExampleData(example?: ProblemExample): ParsedExampleData {
  const input = example?.input || '';
  const bracketArrays = Array.from(input.matchAll(/\[([^\]]+)\]/g)).map(match =>
    match[1].split(',').map(token => token.trim()).filter(Boolean)
  );
  const firstArray = bracketArrays[0] || [];
  const quotedString = Array.from(input.matchAll(/"([^"]+)"/g)).map(match => match[1])[0] || '';
  const stringTokens = quotedString ? quotedString.split('').map(char => (char === ' ' ? '␠' : char)) : [];
  const numericTokens = firstArray.map(token => Number(token)).filter(value => Number.isFinite(value));
  const targetMatch = input.match(/target\s*=\s*(-?\d+)/i) || input.match(/k\s*=\s*(-?\d+)/i);

  return {
    stringTokens,
    arrayTokens: firstArray,
    numericTokens,
    target: targetMatch ? Number(targetMatch[1]) : undefined,
  };
}

function parseMatrix(input: string): string[][] {
  const matrixMatch = input.match(/\[\[([\s\S]*?)\]\]/);
  if (!matrixMatch) return [];

  const rowMatches = Array.from(matrixMatch[1].matchAll(/\[([^\]]+)\]|([^,\[\]]+(?:,[^,\[\]]+)*)/g));
  const rows: string[][] = [];

  for (const match of rowMatches) {
    const content = (match[1] || match[2] || '').trim();
    if (!content) continue;
    const row = content
      .split(',')
      .map(token => token.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
    if (row.length > 0) rows.push(row);
  }

  return rows;
}

function sequenceFromTokens(tokens: string[], activeIndexes: number[] = [], accentIndexes: number[] = []): VisualNode[] {
  return tokens.map((label, index) => ({
    id: `${index}`,
    label,
    active: activeIndexes.includes(index),
    accent: accentIndexes.includes(index),
    muted: index > Math.max(...activeIndexes, ...accentIndexes, -1) + 2,
  }));
}

function ensureTokens(problem: RepoLeetcodeProblem, data: ParsedExampleData): string[] {
  if (data.arrayTokens.length > 0) return data.arrayTokens;
  if (data.stringTokens.length > 0) return data.stringTokens;
  return problem.title.split(/\s+/).slice(0, 8);
}

function buildDetectionCorpus(problem: RepoLeetcodeProblem, details: RepoReadmeDetails, codeLines: CodeLine[]): string {
  return [
    problem.slug,
    details.title,
    ...problem.tags,
    ...codeLines.slice(0, 40).map(line => line.text),
    details.markdown.slice(0, 1500),
  ].join(' ').toLowerCase();
}

function detectAlgorithmFamily(problem: RepoLeetcodeProblem, details: RepoReadmeDetails, codeLines: CodeLine[]): AlgorithmFamily {
  const topic = problem.topics[0] || 'arrays';
  const corpus = buildDetectionCorpus(problem, details, codeLines);

  if (corpus.includes('sliding window') || corpus.includes('substring') || corpus.includes('window')) return 'sliding-window';
  if (corpus.includes('binary search') || corpus.includes(' mid ') || corpus.includes('left <= right')) return 'binary-search';
  if (corpus.includes('two pointers') || corpus.includes('left++') || corpus.includes('right--')) return 'two-pointers';
  if (corpus.includes('prefix sum')) return 'prefix-sum';
  if (corpus.includes('monotonic') || (topic === 'stack' && corpus.includes('stack'))) return 'stack';
  if (corpus.includes('queue') || corpus.includes('bfs')) return 'queue-bfs';
  if (corpus.includes('dfs') || (topic === 'graphs' && corpus.includes('visited'))) return 'graph-traversal';
  if (topic === 'trees') return 'tree-traversal';
  if (topic === 'recursion' || corpus.includes('backtrack') || corpus.includes('recursion')) return 'recursion-dfs';
  if (topic === 'sorting' || corpus.includes('sort')) return 'sorting';
  if (corpus.includes('hash') || corpus.includes('unordered_map') || corpus.includes('counter')) return 'hash-frequency';
  if (corpus.includes('dp[') || corpus.includes('dynamic programming') || corpus.includes('memo')) return 'dynamic-programming';
  return 'generic-sequence';
}

function estimateFamilyConfidence(problem: RepoLeetcodeProblem, details: RepoReadmeDetails, codeLines: CodeLine[], family: AlgorithmFamily): ExecutionConfidence {
  const topic = problem.topics[0] || 'arrays';
  const corpus = buildDetectionCorpus(problem, details, codeLines);

  const indicators: Record<AlgorithmFamily, string[]> = {
    'sliding-window': ['sliding window', 'substring', 'window'],
    'two-pointers': ['two pointers', 'left++', 'right--'],
    'binary-search': ['binary search', ' mid ', 'left <= right'],
    sorting: ['sort', 'partition', 'merge sort'],
    stack: ['stack', 'monotonic', 'push', 'pop'],
    'queue-bfs': ['queue', 'bfs', 'level order'],
    'graph-traversal': ['graph', 'dfs', 'visited', 'adj'],
    'tree-traversal': ['tree', 'binary tree', 'bst'],
    'recursion-dfs': ['recursion', 'backtrack', 'dfs'],
    'prefix-sum': ['prefix sum', 'cumulative'],
    'hash-frequency': ['hash', 'counter', 'unordered_map', 'frequency'],
    'dynamic-programming': ['dynamic programming', 'dp[', 'memo'],
    'generic-sequence': [],
  };

  const hits = indicators[family].filter(token => corpus.includes(token)).length;
  if (family === 'generic-sequence') return 'low';
  if (hits >= 2) return 'high';
  if (hits === 1) return 'medium';

  const topicFamilyMap: Partial<Record<AlgorithmFamily, string[]>> = {
    'tree-traversal': ['trees'],
    'graph-traversal': ['graphs'],
    'queue-bfs': ['queue', 'graphs', 'trees'],
    stack: ['stack'],
    sorting: ['sorting'],
    'recursion-dfs': ['recursion'],
    'two-pointers': ['arrays', 'linked-list'],
    'sliding-window': ['arrays'],
    'binary-search': ['arrays'],
    'prefix-sum': ['arrays'],
    'hash-frequency': ['arrays'],
    'dynamic-programming': ['arrays', 'recursion'],
  };

  if (topicFamilyMap[family]?.includes(topic)) return 'medium';
  return 'low';
}

function pickLine(codeLines: CodeLine[], index: number): number {
  if (codeLines.length === 0) return 1;
  return codeLines[Math.min(index, codeLines.length - 1)].number;
}

function buildLongestSubstringSpecific(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.stringTokens.length > 0 ? data.stringTokens : ensureTokens(problem, data);
  const positions = new Map<string, number>();
  const steps: ExecutionStep[] = [];
  let left = 0;
  let best = 0;

  for (let right = 0; right < tokens.length; right += 1) {
    const token = tokens[right];
    if (positions.has(token) && (positions.get(token) as number) >= left) {
      left = (positions.get(token) as number) + 1;
      steps.push({
        id: steps.length,
        lineNumber: pickLine(codeLines, 1),
        title: 'Shift left pointer',
        detail: `Character ${token} repeated, move left after its previous index.`,
        stateLabel: `Window [${left}, ${right}]`,
        family: 'sliding-window',
        kind: 'sequence',
        sequence: sequenceFromTokens(tokens, [right], Array.from({ length: right - left + 1 }, (_, offset) => left + offset)),
        pointers: [
          { key: 'l', index: left, color: 'bg-orange-500' },
          { key: 'r', index: right, color: 'bg-primary' },
        ],
        variables: [
          { key: 'seen', value: `${token}->${positions.get(token)}`, tone: 'muted' },
          { key: 'best', value: String(best), tone: 'accent' },
        ],
      });
    }

    positions.set(token, right);
    best = Math.max(best, right - left + 1);

    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, 2),
      title: 'Expand and update',
      detail: `Include ${token} and update best window length.`,
      stateLabel: `Best = ${best}`,
      family: 'sliding-window',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [right], Array.from({ length: right - left + 1 }, (_, offset) => left + offset)),
      pointers: [
        { key: 'l', index: left, color: 'bg-orange-500' },
        { key: 'r', index: right, color: 'bg-primary' },
      ],
      variables: [
        { key: 'char', value: token, tone: 'primary' },
        { key: 'best', value: String(best), tone: 'accent' },
      ],
      summary: example?.explanation,
    });
  }

  return steps;
}

function buildRotatedBinarySearchSpecific(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const values = data.numericTokens.length > 0 ? data.numericTokens : ensureTokens(problem, data).map(token => Number(token)).filter(Number.isFinite);
  const tokens = values.length > 0 ? values.map(String) : ensureTokens(problem, data);
  const target = data.target ?? (values[0] ?? undefined);
  const steps: ExecutionStep[] = [];

  let low = 0;
  let high = tokens.length - 1;

  while (low <= high && steps.length < 16) {
    const mid = Math.floor((low + high) / 2);
    const midVal = values[mid] ?? Number(tokens[mid]);
    const lowVal = values[low] ?? Number(tokens[low]);
    const highVal = values[high] ?? Number(tokens[high]);

    const leftSorted = lowVal <= midVal;
    const move = target == null
      ? 'n/a'
      : leftSorted
        ? (target >= lowVal && target < midVal ? 'left' : 'right')
        : (target > midVal && target <= highVal ? 'right' : 'left');

    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 5),
      title: 'Check sorted half',
      detail: leftSorted
        ? 'Left half is sorted; decide if target is inside it.'
        : 'Right half is sorted; decide if target is inside it.',
      stateLabel: `Range [${low}, ${high}]`,
      family: 'binary-search',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [mid], Array.from({ length: high - low + 1 }, (_, offset) => low + offset)),
      pointers: [
        { key: 'low', index: low, color: 'bg-orange-500' },
        { key: 'mid', index: mid, color: 'bg-primary' },
        { key: 'high', index: high, color: 'bg-emerald-500' },
      ],
      variables: [
        { key: 'target', value: target != null ? String(target) : '?' },
        { key: 'midVal', value: String(midVal), tone: 'primary' },
        { key: 'sorted', value: leftSorted ? 'left' : 'right' },
      ],
      summary: move === 'n/a' ? undefined : `Move ${move}`,
    });

    if (target == null || midVal === target) break;

    if (leftSorted) {
      if (target >= lowVal && target < midVal) high = mid - 1;
      else low = mid + 1;
    } else {
      if (target > midVal && target <= highVal) low = mid + 1;
      else high = mid - 1;
    }
  }

  return steps;
}

function inorderIndices(length: number, index: number, out: number[]) {
  if (index >= length) return;
  inorderIndices(length, index * 2 + 1, out);
  out.push(index);
  inorderIndices(length, index * 2 + 2, out);
}

function buildTreeInorderSpecific(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.arrayTokens.length > 0 ? data.arrayTokens : ensureTokens(problem, data);
  const nodes = tokens.filter(token => token.toLowerCase() !== 'null' && token !== '#').slice(0, 15);
  const order: number[] = [];
  inorderIndices(nodes.length, 0, order);

  return order.map((nodeIndex, stepIndex) => ({
    id: stepIndex,
    lineNumber: pickLine(codeLines, stepIndex % 4),
    title: `Visit ${nodes[nodeIndex]}`,
    detail: 'Inorder traversal: left subtree, node, right subtree.',
    stateLabel: `Traversal ${stepIndex + 1}/${order.length}`,
    family: 'tree-traversal',
    kind: 'tree',
    treeLevels: buildTreeLevels(nodes, nodes[nodeIndex]),
    variables: [
      { key: 'node', value: nodes[nodeIndex], tone: 'primary' },
      { key: 'index', value: String(nodeIndex) },
    ],
    summary: example?.explanation,
  }));
}

function buildTreeLevelOrderSpecific(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.arrayTokens.length > 0 ? data.arrayTokens : ensureTokens(problem, data);
  const nodes = tokens.filter(token => token.toLowerCase() !== 'null' && token !== '#').slice(0, 15);
  const queue: number[] = nodes.length > 0 ? [0] : [];
  const steps: ExecutionStep[] = [];

  while (queue.length > 0 && steps.length < 16) {
    const idx = queue.shift() as number;
    const left = idx * 2 + 1;
    const right = idx * 2 + 2;
    if (left < nodes.length) queue.push(left);
    if (right < nodes.length) queue.push(right);

    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 4),
      title: `Dequeue ${nodes[idx]}`,
      detail: 'Process current node and enqueue children for next level.',
      stateLabel: `Queue length ${queue.length}`,
      family: 'queue-bfs',
      kind: 'tree',
      treeLevels: buildTreeLevels(nodes, nodes[idx]),
      variables: [
        { key: 'node', value: nodes[idx], tone: 'primary' },
        { key: 'queue', value: queue.map(item => nodes[item]).join(', ') || 'empty' },
      ],
      summary: example?.explanation,
    });
  }

  return steps;
}

function buildNumberOfIslandsSpecific(_problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const matrix = parseMatrix(example?.input || '');
  const grid = matrix.length > 0
    ? matrix
    : [
        ['1', '1', '0', '0'],
        ['1', '0', '0', '1'],
        ['0', '0', '1', '1'],
      ];

  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const visited = new Set<string>();
  const steps: ExecutionStep[] = [];
  let islands = 0;

  const dfs = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1' || visited.has(key)) return;
    visited.add(key);
    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 5),
      title: `Visit (${r}, ${c})`,
      detail: 'Mark cell as part of the current island component.',
      stateLabel: `Islands found ${islands}`,
      family: 'graph-traversal',
      kind: 'grid',
      grid: grid.map((row, rowIndex) => row.map((cell, colIndex) => {
        const cellKey = `${rowIndex},${colIndex}`;
        if (visited.has(cellKey)) return cell === '1' ? 'V' : cell;
        return cell;
      })),
      variables: [
        { key: 'cell', value: key, tone: 'primary' },
        { key: 'visited', value: String(visited.size) },
      ],
      summary: example?.explanation,
    });
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  };

  for (let r = 0; r < rows && steps.length < 40; r += 1) {
    for (let c = 0; c < cols && steps.length < 40; c += 1) {
      const key = `${r},${c}`;
      if (grid[r][c] === '1' && !visited.has(key)) {
        islands += 1;
        steps.push({
          id: steps.length,
          lineNumber: pickLine(codeLines, steps.length % 5),
          title: `Start island ${islands}`,
          detail: 'Found an unvisited land cell, start DFS flood fill.',
          stateLabel: `Islands found ${islands}`,
          family: 'graph-traversal',
          kind: 'grid',
          grid: grid.map(row => [...row]),
          variables: [
            { key: 'start', value: key, tone: 'primary' },
            { key: 'islands', value: String(islands), tone: 'accent' },
          ],
          summary: example?.explanation,
        });
        dfs(r, c);
      }
    }
  }

  return steps;
}

const SPECIFIC_EXECUTORS: ProblemExecutor[] = [
  {
    id: '0003-longest-substring-without-repeating-characters',
    matches: (problem) => problem.slug === 'longest-substring-without-repeating-characters',
    build: (problem, _details, example, codeLines) => buildLongestSubstringSpecific(problem, example, codeLines),
  },
  {
    id: 'sliding-window-string-family',
    matches: (problem) => matchesSlug(problem, [
      'longest-repeating-character-replacement',
      'permutation-in-string',
      'find-all-anagrams-in-a-string',
      'minimum-window-substring',
      'substring-with-concatenation-of-all-words',
      'maximum-number-of-vowels-in-a-substring-of-given-length',
      'count-number-of-nice-subarrays',
      'fruit-into-baskets',
      'longest-subarray-of-1s-after-deleting-one-element',
      'maximum-erasure-value',
      'frequency-of-the-most-frequent-element',
    ]),
    build: (problem, _details, example, codeLines) => buildLongestSubstringSpecific(problem, example, codeLines),
  },
  {
    id: 'rotated-array-binary-search-family',
    matches: (problem) => matchesSlug(problem, [
      'search-in-rotated-sorted-array',
      'find-minimum-in-rotated-sorted-array',
      'search-in-rotated-sorted-array-ii',
      'find-minimum-in-rotated-sorted-array-ii',
      'search-a-2d-matrix',
      'search-a-2d-matrix-ii',
      'single-element-in-a-sorted-array',
      'find-peak-element',
      'find-first-and-last-position-of-element-in-sorted-array',
      'koko-eating-bananas',
      'capacity-to-ship-packages-within-d-days',
      'median-of-two-sorted-arrays',
    ]),
    build: (problem, _details, example, codeLines) => buildRotatedBinarySearchSpecific(problem, example, codeLines),
  },
  {
    id: 'binary-tree-inorder-traversal',
    matches: (problem) => matchesSlug(problem, [
      'binary-tree-inorder-traversal',
      'kth-smallest-element-in-a-bst',
      'validate-binary-search-tree',
      'recover-binary-search-tree',
      'minimum-absolute-difference-in-bst',
      'range-sum-of-bst',
      'all-elements-in-two-binary-search-trees',
    ]),
    build: (problem, _details, example, codeLines) => buildTreeInorderSpecific(problem, example, codeLines),
  },
  {
    id: 'binary-tree-level-order-traversal',
    matches: (problem) => matchesSlug(problem, [
      'binary-tree-level-order-traversal',
      'binary-tree-level-order-traversal-ii',
      'binary-tree-zigzag-level-order-traversal',
      'binary-tree-right-side-view',
      'average-of-levels-in-binary-tree',
      'find-largest-value-in-each-tree-row',
      'maximum-level-sum-of-a-binary-tree',
      'minimum-depth-of-binary-tree',
      'deepest-leaves-sum',
      'even-odd-tree',
    ]),
    build: (problem, _details, example, codeLines) => buildTreeLevelOrderSpecific(problem, example, codeLines),
  },
  {
    id: 'number-of-islands',
    matches: (problem) => matchesSlug(problem, [
      'number-of-islands',
      'max-area-of-island',
      'island-perimeter',
      'number-of-enclaves',
      'surrounded-regions',
      'number-of-closed-islands',
      'count-sub-islands',
      'as-far-from-land-as-possible',
      'rotting-oranges',
      'walls-and-gates',
      'flood-fill',
      'pacific-atlantic-water-flow',
    ]),
    build: (problem, _details, example, codeLines) => buildNumberOfIslandsSpecific(problem, example, codeLines),
  },
  {
    id: 'two-pointers-sum-and-partition-family',
    matches: (problem) => matchesSlug(problem, [
      'two-sum-ii-input-array-is-sorted',
      '3sum',
      '3sum-closest',
      '4sum',
      'container-with-most-water',
      'valid-palindrome',
      'palindrome-linked-list',
      'sort-colors',
      'remove-duplicates-from-sorted-array',
      'remove-element',
      'squares-of-a-sorted-array',
      'move-zeroes',
      'reverse-string',
      'merge-sorted-array',
    ]),
    build: (problem, _details, example, codeLines) => buildTwoPointers(problem, example, codeLines),
  },
  {
    id: 'monotonic-stack-family',
    matches: (problem) => matchesSlug(problem, [
      'valid-parentheses',
      'daily-temperatures',
      'next-greater-element-i',
      'next-greater-element-ii',
      'largest-rectangle-in-histogram',
      'trapping-rain-water',
      'remove-k-digits',
      'decode-string',
      'evaluate-reverse-polish-notation',
      'min-stack',
      'online-stock-span',
      'basic-calculator',
      'basic-calculator-ii',
      'asteroid-collision',
    ]),
    build: (problem, _details, example, codeLines) => buildStack(problem, example, codeLines),
  },
  {
    id: 'prefix-sum-family',
    matches: (problem) => matchesSlug(problem, [
      'subarray-sum-equals-k',
      'range-sum-query-immutable',
      'running-sum-of-1d-array',
      'find-pivot-index',
      'find-the-middle-index-in-array',
      'maximum-average-subarray-i',
      'continuous-subarray-sum',
      'maximum-size-subarray-sum-equals-k',
      'product-of-array-except-self',
      'sum-of-all-odd-length-subarrays',
    ]),
    build: (problem, _details, example, codeLines) => buildPrefixSum(problem, example, codeLines),
  },
  {
    id: 'dynamic-programming-family',
    matches: (problem) => matchesSlug(problem, [
      'climbing-stairs',
      'house-robber',
      'house-robber-ii',
      'min-cost-climbing-stairs',
      'coin-change',
      'coin-change-ii',
      'unique-paths',
      'unique-paths-ii',
      'minimum-path-sum',
      'best-time-to-buy-and-sell-stock',
      'best-time-to-buy-and-sell-stock-ii',
      'best-time-to-buy-and-sell-stock-with-cooldown',
      'longest-increasing-subsequence',
      'longest-common-subsequence',
      'edit-distance',
      'word-break',
      'decode-ways',
      'partition-equal-subset-sum',
      'target-sum',
      'combination-sum-iv',
      'maximum-subarray',
      'jump-game',
      'jump-game-ii',
    ]),
    build: (problem, _details, example, codeLines) => buildDynamicProgramming(problem, example, codeLines),
  },
  {
    id: 'graph-traversal-and-topo-family',
    matches: (problem) => matchesSlug(problem, [
      'clone-graph',
      'course-schedule',
      'course-schedule-ii',
      'reconstruct-itinerary',
      'network-delay-time',
      'cheapest-flights-within-k-stops',
      'word-ladder',
      'open-the-lock',
      'keys-and-rooms',
      'find-if-path-exists-in-graph',
      'possible-bipartition',
      'is-graph-bipartite',
      'number-of-provinces',
      'all-paths-from-source-to-target',
      'minimum-height-trees',
      'redundant-connection',
    ]),
    build: (problem, _details, example, codeLines) => buildGraphTraversal(problem, example, codeLines),
  },
  {
    id: 'queue-bfs-grid-and-graph-family',
    matches: (problem) => matchesSlug(problem, [
      'binary-tree-level-order-traversal',
      'binary-tree-zigzag-level-order-traversal',
      'binary-tree-right-side-view',
      'serialize-and-deserialize-binary-tree',
      'n-ary-tree-level-order-traversal',
      'populating-next-right-pointers-in-each-node',
      'populating-next-right-pointers-in-each-node-ii',
      '01-matrix',
      'shortest-path-in-binary-matrix',
      'shortest-path-in-a-grid-with-obstacles-elimination',
      'nearest-exit-from-entrance-in-maze',
      'minimum-knight-moves',
      'word-ladder-ii',
      'jump-game-iii',
      'minimum-genetic-mutation',
      'snakes-and-ladders',
    ]),
    build: (problem, _details, example, codeLines) => buildQueueBfs(problem, example, codeLines),
  },
  {
    id: 'hash-frequency-family',
    matches: (problem) => matchesSlug(problem, [
      'two-sum',
      'group-anagrams',
      'valid-anagram',
      'ransom-note',
      'first-unique-character-in-a-string',
      'majority-element',
      'top-k-frequent-elements',
      'top-k-frequent-words',
      'contains-duplicate',
      'contains-duplicate-ii',
      'contains-duplicate-iii',
      'isomorphic-strings',
      'word-pattern',
      'happy-number',
      'longest-consecutive-sequence',
      'find-all-duplicates-in-an-array',
      'find-the-difference',
      'intersection-of-two-arrays',
      'intersection-of-two-arrays-ii',
      'subarray-sums-divisible-by-k',
    ]),
    build: (problem, _details, example, codeLines) => buildHashFrequency(problem, example, codeLines),
  },
  {
    id: 'tree-dfs-family',
    matches: (problem) => matchesSlug(problem, [
      'binary-tree-preorder-traversal',
      'binary-tree-postorder-traversal',
      'invert-binary-tree',
      'same-tree',
      'symmetric-tree',
      'path-sum',
      'path-sum-ii',
      'sum-root-to-leaf-numbers',
      'binary-tree-maximum-path-sum',
      'diameter-of-binary-tree',
      'balanced-binary-tree',
      'maximum-depth-of-binary-tree',
      'lowest-common-ancestor-of-a-binary-tree',
      'lowest-common-ancestor-of-a-binary-search-tree',
      'flatten-binary-tree-to-linked-list',
      'construct-binary-tree-from-preorder-and-inorder-traversal',
      'construct-binary-tree-from-inorder-and-postorder-traversal',
      'subtree-of-another-tree',
      'count-complete-tree-nodes',
      'binary-tree-paths',
    ]),
    build: (problem, _details, example, codeLines) => buildTreeTraversal(problem, example, codeLines),
  },
  {
    id: 'recursion-backtracking-family',
    matches: (problem) => matchesSlug(problem, [
      'subsets',
      'subsets-ii',
      'permutations',
      'permutations-ii',
      'combinations',
      'combination-sum',
      'combination-sum-ii',
      'combination-sum-iii',
      'letter-combinations-of-a-phone-number',
      'generate-parentheses',
      'restore-ip-addresses',
      'palindrome-partitioning',
      'word-search',
      'n-queens',
      'n-queens-ii',
      'sudoku-solver',
      'matchsticks-to-square',
      'beautiful-arrangement',
      'partition-to-k-equal-sum-subsets',
      'the-k-th-lexicographical-string-of-all-happy-strings-of-length-n',
    ]),
    build: (problem, _details, example, codeLines) => buildRecursion(problem, example, codeLines),
  },
  {
    id: 'interval-greedy-sorting-family',
    matches: (problem) => matchesSlug(problem, [
      'merge-intervals',
      'insert-interval',
      'non-overlapping-intervals',
      'minimum-number-of-arrows-to-burst-balloons',
      'meeting-rooms',
      'meeting-rooms-ii',
      'task-scheduler',
      'queue-reconstruction-by-height',
      'reorganize-string',
      'hand-of-straights',
      'car-fleet',
      'boats-to-save-people',
      'bag-of-tokens',
      'partition-labels',
      'gas-station',
      'candy',
      'wiggle-subsequence',
      'jump-game-vi',
      'maximum-units-on-a-truck',
      'erase-overlap-intervals',
    ]),
    build: (problem, _details, example, codeLines) => buildSorting(problem, example, codeLines),
  },
  {
    id: 'trie-and-word-search-family',
    matches: (problem) => matchesSlug(problem, [
      'implement-trie-prefix-tree',
      'design-add-and-search-words-data-structure',
      'word-search-ii',
      'replace-words',
      'map-sum-pairs',
      'longest-word-in-dictionary',
      'longest-word-in-dictionary-through-deleting',
      'short-encoding-of-words',
      'prefix-and-suffix-search',
      'stream-of-characters',
      'search-suggestions-system',
      'sum-of-prefix-scores-of-strings',
      'count-prefix-and-suffix-pairs-i',
      'extra-characters-in-a-string',
      'remove-sub-folders-from-the-filesystem',
    ]),
    build: (problem, _details, example, codeLines) => buildGraphTraversal(problem, example, codeLines),
  },
  {
    id: 'heap-priority-queue-family',
    matches: (problem) => matchesSlug(problem, [
      'kth-largest-element-in-an-array',
      'find-k-pairs-with-smallest-sums',
      'merge-k-sorted-lists',
      'find-median-from-data-stream',
      'top-k-frequent-elements',
      'top-k-frequent-words',
      'sliding-window-maximum',
      'last-stone-weight',
      'reorganize-string',
      'task-scheduler',
      'the-skyline-problem',
      'meeting-rooms-ii',
      'ipo',
      'minimum-cost-to-hire-k-workers',
      'find-k-closest-elements',
      'kth-smallest-element-in-a-sorted-matrix',
      'k-closest-points-to-origin',
      'sort-characters-by-frequency',
      'smallest-range-covering-elements-from-k-lists',
      'maximum-performance-of-a-team',
      'single-threaded-cpu',
      'process-tasks-using-servers',
      'take-gifts-from-the-richest-pile',
      'minimum-operations-to-halve-array-sum',
      'final-array-state-after-k-multiplication-operations-i',
    ]),
    build: (problem, _details, example, codeLines) => buildQueueBfs(problem, example, codeLines),
  },
  {
    id: 'union-find-disjoint-set-family',
    matches: (problem) => matchesSlug(problem, [
      'number-of-provinces',
      'redundant-connection',
      'redundant-connection-ii',
      'accounts-merge',
      'most-stones-removed-with-same-row-or-column',
      'satisfiability-of-equality-equations',
      'graph-valid-tree',
      'number-of-connected-components-in-an-undirected-graph',
      'number-of-operations-to-make-network-connected',
      'checking-existence-of-edge-length-limited-paths',
      'smallest-string-with-swaps',
      'bricks-falling-when-hit',
      'regions-cut-by-slashes',
      'swim-in-rising-water',
      'min-cost-to-connect-all-points',
      'optimize-water-distribution-in-a-village',
      'remove-max-number-of-edges-to-keep-graph-fully-traversable',
      'lexicographically-smallest-equivalent-string',
      'find-all-people-with-secret',
      'count-unreachable-pairs-of-nodes-in-an-undirected-graph',
      'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree',
      'path-with-minimum-effort',
    ]),
    build: (problem, _details, example, codeLines) => buildGraphTraversal(problem, example, codeLines),
  },
  {
    id: 'bit-manipulation-family',
    matches: (problem) => matchesSlug(problem, [
      'single-number',
      'single-number-ii',
      'single-number-iii',
      'number-of-1-bits',
      'counting-bits',
      'reverse-bits',
      'power-of-two',
      'power-of-four',
      'sum-of-two-integers',
      'bitwise-and-of-numbers-range',
      'maximum-xor-of-two-numbers-in-an-array',
      'minimum-flips-to-make-a-or-b-equal-to-c',
      'minimum-bit-flips-to-convert-number',
      'find-the-original-array-of-prefix-xor',
      'neighboring-bitwise-xor',
      'xor-queries-of-a-subarray',
      'add-binary',
      'binary-number-with-alternating-bits',
      'gray-code',
      'subsets',
    ]),
    build: (problem, _details, example, codeLines) => buildHashFrequency(problem, example, codeLines),
  },
  {
    id: 'math-number-theory-family',
    matches: (problem) => matchesSlug(problem, [
      'palindrome-number',
      'reverse-integer',
      'string-to-integer-atoi',
      'divide-two-integers',
      'powx-n',
      'sqrtx',
      'factorial-trailing-zeroes',
      'excel-sheet-column-number',
      'excel-sheet-column-title',
      'happy-number',
      'count-primes',
      'plus-one',
      'add-digits',
      'ugly-number',
      'ugly-number-ii',
      'perfect-squares',
      'integer-break',
      'fraction-to-recurring-decimal',
      'water-and-jug-problem',
      'bulb-switcher',
      'nth-digit',
      'super-pow',
      'power-of-three',
      'largest-palindrome-product',
      'sum-of-square-numbers',
    ]),
    build: (problem, _details, example, codeLines) => buildGenericSequence(problem, example, codeLines),
  },
  {
    id: 'design-data-structure-api-family',
    matches: (problem) => matchesSlug(problem, [
      'lru-cache',
      'lfu-cache',
      'insert-delete-getrandom-o1',
      'insert-delete-getrandom-o1-duplicates-allowed',
      'design-twitter',
      'design-hashmap',
      'design-hashset',
      'design-circular-queue',
      'design-linked-list',
      'implement-queue-using-stacks',
      'implement-stack-using-queues',
      'design-browser-history',
      'time-based-key-value-store',
      'all-oone-data-structure',
      'random-pick-with-weight',
      'shuffle-an-array',
      'serialize-and-deserialize-bst',
      'serialize-and-deserialize-binary-tree',
      'design-hit-counter',
      'design-underground-system',
      'design-front-middle-back-queue',
      'design-a-food-rating-system',
      'design-memory-allocator',
      'design-graph-with-shortest-path-calculator',
      'number-containers-system',
    ]),
    build: (problem, _details, example, codeLines) => buildQueueBfs(problem, example, codeLines),
  },
];

function buildSlidingWindow(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.stringTokens.length > 0 ? data.stringTokens : ensureTokens(problem, data);
  const counts = new Map<string, number>();
  const steps: ExecutionStep[] = [];
  let left = 0;
  let best = 0;

  tokens.forEach((token, right) => {
    counts.set(token, (counts.get(token) || 0) + 1);
    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, 0),
      title: `Expand to ${right}`,
      detail: `Move the right pointer to include ${token}.`,
      stateLabel: `Window [${left}, ${right}]`,
      family: 'sliding-window',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [right], Array.from({ length: right - left + 1 }, (_, offset) => left + offset)),
      pointers: [
        { key: 'l', index: left, color: 'bg-orange-500' },
        { key: 'r', index: right, color: 'bg-primary' },
      ],
      variables: [
        { key: 'best', value: String(best), tone: 'accent' },
        { key: 'token', value: token, tone: 'primary' },
      ],
      summary: example?.explanation,
    });

    while ((counts.get(token) || 0) > 1 && left <= right) {
      const leftToken = tokens[left];
      counts.set(leftToken, (counts.get(leftToken) || 1) - 1);
      left += 1;
      steps.push({
        id: steps.length,
        lineNumber: pickLine(codeLines, 1),
        title: 'Shrink left',
        detail: `Duplicate found, move left pointer to restore a valid window.`,
        stateLabel: `Window [${left}, ${right}]`,
        family: 'sliding-window',
        kind: 'sequence',
        sequence: sequenceFromTokens(tokens, [right], Array.from({ length: right - left + 1 }, (_, offset) => left + offset)),
        pointers: [
          { key: 'l', index: left, color: 'bg-orange-500' },
          { key: 'r', index: right, color: 'bg-primary' },
        ],
        variables: [
          { key: 'best', value: String(best), tone: 'accent' },
        ],
      });
    }

    best = Math.max(best, right - left + 1);
    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, 2),
      title: 'Update answer',
      detail: `Record the longest valid window seen so far.`,
      stateLabel: `Best length = ${best}`,
      family: 'sliding-window',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [right], Array.from({ length: right - left + 1 }, (_, offset) => left + offset)),
      pointers: [
        { key: 'l', index: left, color: 'bg-orange-500' },
        { key: 'r', index: right, color: 'bg-primary' },
      ],
      variables: [
        { key: 'best', value: String(best), tone: 'primary' },
        { key: 'window', value: `${left}..${right}` },
      ],
    });
  });

  return steps;
}

function buildTwoPointers(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = ensureTokens(problem, data);
  const numeric = data.numericTokens.length === tokens.length ? data.numericTokens : tokens.map(token => Number(token)).filter(value => Number.isFinite(value));
  const steps: ExecutionStep[] = [];
  let left = 0;
  let right = tokens.length - 1;

  while (left <= right && steps.length < Math.max(tokens.length * 2, 6)) {
    const current = numeric.length === tokens.length ? numeric[left] + (numeric[right] || 0) : undefined;
    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 4),
      title: 'Compare endpoints',
      detail: current != null && data.target != null
        ? `Compare ${numeric[left]} + ${numeric[right]} with target ${data.target}.`
        : 'Inspect the left and right pointers and decide how to move them.',
      stateLabel: `Pointers at ${left} and ${right}`,
      family: 'two-pointers',
      kind: problem.topics.includes('linked-list') ? 'linked-list' : 'sequence',
      sequence: sequenceFromTokens(tokens, [left, right], Array.from({ length: Math.max(0, right - left + 1) }, (_, offset) => left + offset)),
      linkedList: problem.topics.includes('linked-list') ? sequenceFromTokens(tokens, [left, right], []) : undefined,
      pointers: [
        { key: 'l', index: left, color: 'bg-orange-500' },
        { key: 'r', index: right, color: 'bg-primary' },
      ],
      variables: current != null ? [{ key: 'sum', value: String(current), tone: 'accent' }] : undefined,
      summary: example?.explanation,
    });

    if (data.target != null && current != null) {
      if (current === data.target) break;
      if (current < data.target) left += 1;
      else right -= 1;
    } else {
      left += 1;
      right -= 1;
    }
  }

  return steps;
}

function buildBinarySearch(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const numeric = [...data.numericTokens].sort((a, b) => a - b);
  const tokens = numeric.length > 0 ? numeric.map(String) : ensureTokens(problem, data);
  const target = data.target ?? (numeric.length > 0 ? numeric[Math.floor(numeric.length / 2)] : undefined);
  const steps: ExecutionStep[] = [];
  let low = 0;
  let high = tokens.length - 1;

  while (low <= high && steps.length < 12) {
    const mid = Math.floor((low + high) / 2);
    const midValue = numeric[mid] ?? Number(tokens[mid]);
    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 4),
      title: `Check mid ${mid}`,
      detail: `Search the current half by comparing the middle element with the target.`,
      stateLabel: `Range [${low}, ${high}]`,
      family: 'binary-search',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [mid], Array.from({ length: high - low + 1 }, (_, offset) => low + offset)),
      pointers: [
        { key: 'low', index: low, color: 'bg-orange-500' },
        { key: 'mid', index: mid, color: 'bg-primary' },
        { key: 'high', index: high, color: 'bg-emerald-500' },
      ],
      variables: [
        { key: 'target', value: target != null ? String(target) : '?' },
        { key: 'midVal', value: String(midValue), tone: 'primary' },
      ],
      summary: example?.explanation,
    });

    if (target == null || midValue === target) break;
    if (midValue < target) low = mid + 1;
    else high = mid - 1;
  }

  return steps;
}

function buildSorting(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const values = data.numericTokens.length > 0 ? [...data.numericTokens] : ensureTokens(problem, data).map(token => Number(token)).filter(Number.isFinite);
  const tokens = values.length > 0 ? values.map(String) : ensureTokens(problem, data);
  const work = [...tokens];
  const steps: ExecutionStep[] = [];

  for (let pass = 0; pass < work.length - 1 && steps.length < 24; pass += 1) {
    for (let index = 0; index < work.length - pass - 1 && steps.length < 24; index += 1) {
      const compareLeft = Number(work[index]);
      const compareRight = Number(work[index + 1]);
      const shouldSwap = Number.isFinite(compareLeft) && Number.isFinite(compareRight)
        ? compareLeft > compareRight
        : work[index].localeCompare(work[index + 1]) > 0;
      if (shouldSwap) {
        [work[index], work[index + 1]] = [work[index + 1], work[index]];
      }
      steps.push({
        id: steps.length,
        lineNumber: pickLine(codeLines, steps.length % 5),
        title: `Pass ${pass + 1}`,
        detail: shouldSwap ? `Swap adjacent elements to move larger values rightward.` : `Keep the pair as-is; it is already ordered.`,
        stateLabel: `Sorted suffix size ${pass}`,
        family: 'sorting',
        kind: 'sequence',
        sequence: sequenceFromTokens(work, [index, index + 1], [work.length - pass - 1]),
        pointers: [
          { key: 'j', index, color: 'bg-primary' },
          { key: 'j+1', index: index + 1, color: 'bg-orange-500' },
        ],
        variables: [{ key: 'swap', value: shouldSwap ? 'yes' : 'no', tone: shouldSwap ? 'accent' : 'muted' }],
      });
    }
  }

  return steps;
}

function buildStack(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = ensureTokens(problem, data);
  const stack: string[] = [];
  return tokens.slice(0, 12).map((token, index) => {
    if (index % 3 === 2 && stack.length > 0) {
      stack.pop();
    } else {
      stack.push(token);
    }
    return {
      id: index,
      lineNumber: pickLine(codeLines, index % 4),
      title: index % 3 === 2 ? 'Pop stack' : 'Push stack',
      detail: index % 3 === 2 ? `Resolve the top of the stack before continuing.` : `Add ${token} to the stack state.`,
      stateLabel: `Stack size ${stack.length}`,
      family: 'stack',
      kind: 'stack',
      sequence: sequenceFromTokens(stack, [stack.length - 1]),
      pointers: stack.length > 0 ? [{ key: 'top', index: stack.length - 1, color: 'bg-primary' }] : [],
      variables: [{ key: 'token', value: token }],
    };
  });
}

function buildQueueBfs(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = ensureTokens(problem, data).slice(0, 10);
  const visited = new Set<string>();
  const queue: string[] = tokens.length > 0 ? [tokens[0]] : [];
  const steps: ExecutionStep[] = [];

  while (queue.length > 0 && steps.length < 12) {
    const current = queue.shift()!;
    visited.add(current);
    const currentIndex = tokens.indexOf(current);
    const nextIndex = currentIndex + 1;
    if (nextIndex < tokens.length) queue.push(tokens[nextIndex]);

    steps.push({
      id: steps.length,
      lineNumber: pickLine(codeLines, steps.length % 4),
      title: 'Process queue front',
      detail: `Dequeue ${current} and expand its frontier.`,
      stateLabel: `Visited ${visited.size} nodes`,
      family: 'queue-bfs',
      kind: problem.topics.includes('graphs') ? 'graph' : 'queue',
      sequence: problem.topics.includes('graphs') ? undefined : sequenceFromTokens(queue.length > 0 ? queue : [current], [0]),
      pointers: problem.topics.includes('graphs') ? [] : [{ key: 'front', index: 0, color: 'bg-primary' }],
      graphNodes: problem.topics.includes('graphs') ? makeGraph(tokens).nodes.map(node => ({ ...node, active: node.label === current })) : undefined,
      graphEdges: problem.topics.includes('graphs') ? makeGraph(tokens).edges : undefined,
      variables: [
        { key: 'node', value: current, tone: 'primary' },
        { key: 'queue', value: queue.join(', ') || 'empty' },
      ],
      summary: example?.explanation,
    });
  }

  return steps;
}

function buildTreeTraversal(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.arrayTokens.length > 0 ? data.arrayTokens : ensureTokens(problem, data);
  const filtered = tokens.filter(token => token.toLowerCase() !== 'null' && token !== '#').slice(0, 15);
  const order = filtered;
  return order.map((node, index) => ({
    id: index,
    lineNumber: pickLine(codeLines, index % 4),
    title: `Visit node ${node}`,
    detail: `Traverse the next tree node according to the current strategy.`,
    stateLabel: `Visited ${index + 1}/${order.length}`,
    family: 'tree-traversal',
    kind: 'tree',
    treeLevels: buildTreeLevels(filtered, node),
    variables: [{ key: 'node', value: node, tone: 'primary' }],
    summary: example?.explanation,
  }));
}

function buildTreeLevels(tokens: string[], activeNode?: string): VisualNode[][] {
  const levels: VisualNode[][] = [];
  let cursor = 0;
  let width = 1;
  while (cursor < tokens.length) {
    levels.push(tokens.slice(cursor, cursor + width).map((label, index) => ({
      id: `${cursor + index}`,
      label,
      active: label === activeNode,
    })));
    cursor += width;
    width *= 2;
  }
  return levels;
}

function buildGraphTraversal(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = ensureTokens(problem, data).slice(0, 8);
  const graph = makeGraph(tokens);
  return graph.nodes.map((node, index) => ({
    id: index,
    lineNumber: pickLine(codeLines, index % 4),
    title: `Explore ${node.label}`,
    detail: `Visit a graph node and relax or inspect adjacent edges.`,
    stateLabel: `Traversal index ${index + 1}`,
    family: 'graph-traversal',
    kind: 'graph',
    graphNodes: graph.nodes.map(item => ({ ...item, active: item.id === node.id })),
    graphEdges: graph.edges.map((edge, edgeIndex) => ({ ...edge, active: edgeIndex <= index })),
    variables: [{ key: 'node', value: node.label, tone: 'primary' }],
    summary: example?.explanation,
  }));
}

function makeGraph(tokens: string[]): { nodes: Array<VisualNode & { x: number; y: number }>; edges: VisualEdge[] } {
  const base = tokens.length > 0 ? tokens : ['0', '1', '2', '3'];
  const nodes = base.map((label, index) => {
    const angle = (Math.PI * 2 * index) / base.length;
    return {
      id: `${index}`,
      label,
      x: 50 + Math.cos(angle) * 34,
      y: 50 + Math.sin(angle) * 34,
    };
  });
  const edges = nodes.map((node, index) => ({ from: node.id, to: nodes[(index + 1) % nodes.length].id }));
  return { nodes, edges };
}

function buildRecursion(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const depth = Math.min(6, Math.max(3, (example?.input.match(/\d+/)?.[0] ? Number(example.input.match(/\d+/)?.[0]) : 4)));
  return Array.from({ length: depth }, (_, index) => ({
    id: index,
    lineNumber: pickLine(codeLines, index % 4),
    title: index < depth - 1 ? `Recurse to depth ${index + 1}` : 'Unwind recursion',
    detail: index < depth - 1 ? 'Push a new stack frame and solve a smaller subproblem.' : 'Return from the base case and combine results.',
    stateLabel: `Depth ${Math.min(index + 1, depth)}`,
    family: 'recursion-dfs',
    kind: 'recursion',
    callStack: Array.from({ length: depth - index }, (_, stackIndex) => `${problem.slug}(${depth - stackIndex})`),
    variables: [{ key: 'depth', value: String(index + 1), tone: 'primary' }],
    summary: example?.explanation,
  }));
}

function buildPrefixSum(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const numbers = data.numericTokens.length > 0 ? data.numericTokens : ensureTokens(problem, data).map(token => Number(token)).filter(Number.isFinite);
  let prefix = 0;
  return numbers.slice(0, 12).map((value, index) => {
    prefix += value;
    return {
      id: index,
      lineNumber: pickLine(codeLines, index % 4),
      title: `Extend prefix to ${index}`,
      detail: `Add the next value into the running prefix sum.`,
      stateLabel: `Prefix[${index}] = ${prefix}`,
      family: 'prefix-sum',
      kind: 'sequence',
      sequence: sequenceFromTokens(numbers.map(String), [index], Array.from({ length: index + 1 }, (_, offset) => offset)),
      pointers: [{ key: 'i', index, color: 'bg-primary' }],
      variables: [
        { key: 'prefix', value: String(prefix), tone: 'primary' },
        { key: 'value', value: String(value) },
      ],
      summary: example?.explanation,
    };
  });
}

function buildHashFrequency(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = data.stringTokens.length > 0 ? data.stringTokens : ensureTokens(problem, data);
  const counts = new Map<string, number>();
  return tokens.slice(0, 16).map((token, index) => {
    counts.set(token, (counts.get(token) || 0) + 1);
    return {
      id: index,
      lineNumber: pickLine(codeLines, index % 4),
      title: `Count ${token}`,
      detail: `Update the frequency table for the current token.`,
      stateLabel: `Distinct keys ${counts.size}`,
      family: 'hash-frequency',
      kind: 'sequence',
      sequence: sequenceFromTokens(tokens, [index], []),
      pointers: [{ key: 'i', index, color: 'bg-primary' }],
      variables: Array.from(counts.entries()).slice(-4).map(([key, value]) => ({ key, value: String(value) })),
      summary: example?.explanation,
    };
  });
}

function buildDynamicProgramming(_problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const values = data.numericTokens.length > 0 ? data.numericTokens : Array.from({ length: 8 }, (_, index) => index + 1);
  const dp: number[] = [];
  return values.slice(0, 10).map((value, index) => {
    dp[index] = Math.max(value, (dp[index - 1] || 0) + value);
    return {
      id: index,
      lineNumber: pickLine(codeLines, index % 4),
      title: `Fill dp[${index}]`,
      detail: `Compute the next DP state from previous subproblems.`,
      stateLabel: `DP state ${index}`,
      family: 'dynamic-programming',
      kind: 'sequence',
      sequence: sequenceFromTokens(dp.map(String), [index], Array.from({ length: index + 1 }, (_, offset) => offset)),
      pointers: [{ key: 'i', index, color: 'bg-primary' }],
      variables: [
        { key: 'value', value: String(value) },
        { key: 'dp[i]', value: String(dp[index]), tone: 'primary' },
      ],
      summary: example?.explanation,
    };
  });
}

function buildGenericSequence(problem: RepoLeetcodeProblem, example: ProblemExample | undefined, codeLines: CodeLine[]): ExecutionStep[] {
  const data = parseExampleData(example);
  const tokens = ensureTokens(problem, data);
  return tokens.slice(0, 16).map((token, index) => ({
    id: index,
    lineNumber: pickLine(codeLines, index % 4),
    title: `Process ${token}`,
    detail: 'Advance through the input and update the working state.',
    stateLabel: `Position ${index}`,
    family: 'generic-sequence',
    kind: problem.topics.includes('linked-list') ? 'linked-list' : 'sequence',
    sequence: sequenceFromTokens(tokens, [index], []),
    linkedList: problem.topics.includes('linked-list') ? sequenceFromTokens(tokens, [index], []) : undefined,
    pointers: [{ key: 'i', index, color: 'bg-primary' }],
    summary: example?.explanation,
  }));
}

export function buildExecutionPlan(problem: RepoLeetcodeProblem, details: RepoReadmeDetails, example: ProblemExample | undefined, code: string): ExecutionPlan {
  const codeLines = extractCodeLines(code);
  const specific = SPECIFIC_EXECUTORS.find(executor => executor.matches(problem, details));
  if (specific) {
    const specificSteps = specific.build(problem, details, example, codeLines);
    if (specificSteps.length > 0) {
      return {
        steps: specificSteps,
        source: 'specific',
        confidence: 'high',
        executorId: specific.id,
      };
    }
  }
  const family = detectAlgorithmFamily(problem, details, codeLines);
  const confidence = estimateFamilyConfidence(problem, details, codeLines, family);
  let familySteps: ExecutionStep[];

  switch (family) {
    case 'sliding-window':
      familySteps = buildSlidingWindow(problem, example, codeLines);
      break;
    case 'two-pointers':
      familySteps = buildTwoPointers(problem, example, codeLines);
      break;
    case 'binary-search':
      familySteps = buildBinarySearch(problem, example, codeLines);
      break;
    case 'sorting':
      familySteps = buildSorting(problem, example, codeLines);
      break;
    case 'stack':
      familySteps = buildStack(problem, example, codeLines);
      break;
    case 'queue-bfs':
      familySteps = buildQueueBfs(problem, example, codeLines);
      break;
    case 'graph-traversal':
      familySteps = buildGraphTraversal(problem, example, codeLines);
      break;
    case 'tree-traversal':
      familySteps = buildTreeTraversal(problem, example, codeLines);
      break;
    case 'recursion-dfs':
      familySteps = buildRecursion(problem, example, codeLines);
      break;
    case 'prefix-sum':
      familySteps = buildPrefixSum(problem, example, codeLines);
      break;
    case 'hash-frequency':
      familySteps = buildHashFrequency(problem, example, codeLines);
      break;
    case 'dynamic-programming':
      familySteps = buildDynamicProgramming(problem, example, codeLines);
      break;
    default:
      familySteps = buildGenericSequence(problem, example, codeLines);
      break;
  }

  return {
    steps: familySteps,
    source: 'family',
    confidence,
  };
}

export function buildExecutionSteps(problem: RepoLeetcodeProblem, details: RepoReadmeDetails, example: ProblemExample | undefined, code: string): ExecutionStep[] {
  return buildExecutionPlan(problem, details, example, code).steps;
}
