import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import {
  ALL_LANGUAGES,
  LANGUAGE_LABELS,
  SolutionLanguage,
  getSolutionUrlCandidates,
  LeetcodeTopic,
} from '../data/LeetcodeProblems';
import {
  RepoLeetcodeProblem,
  RepoReadmeDetails,
  fetchAllLeetcodeRepoProblems,
  fetchLeetcodeReadmeDetails,
  getProblemDetailPath,
} from '../services/leetcodeRepoService';
import {
  ProblemExample,
  ExecutionStep,
  VisualNode,
  buildExecutionPlan,
  parseConstraints,
  parseExamples,
} from '../services/leetcodeExecutionEngine';

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TOPIC_LABELS: Record<LeetcodeTopic, string> = {
  arrays: 'Arrays',
  'linked-list': 'Linked List',
  stack: 'Stack',
  queue: 'Queue',
  trees: 'Trees',
  graphs: 'Graphs',
  sorting: 'Sorting',
  recursion: 'Recursion',
};

const FAMILY_LABELS: Record<ExecutionStep['family'], string> = {
  'sliding-window': 'Sliding Window',
  'two-pointers': 'Two Pointers',
  'binary-search': 'Binary Search',
  sorting: 'Sorting',
  stack: 'Stack Logic',
  'queue-bfs': 'Queue / BFS',
  'graph-traversal': 'Graph Traversal',
  'tree-traversal': 'Tree Traversal',
  'recursion-dfs': 'Recursion / DFS',
  'prefix-sum': 'Prefix Sum',
  'hash-frequency': 'Hash Frequency',
  'dynamic-programming': 'Dynamic Programming',
  'generic-sequence': 'Generic Sequence',
};

function renderNodeChip(node: VisualNode, compact = false) {
  return (
    <div
      key={node.id}
      className={[
        'rounded-xl border text-center font-bold transition-all',
        compact ? 'min-w-11 px-2.5 py-2 text-xs' : 'min-w-14 px-4 py-4 text-sm',
        node.active
          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
          : node.accent
            ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
            : 'bg-white dark:bg-[#1e1d32] text-gray-800 dark:text-white border-gray-200 dark:border-[#272546]',
      ].join(' ')}
    >
      {node.label}
    </div>
  );
}

function VisualizationSurface({ step }: { step: ExecutionStep }) {
  if (step.kind === 'linked-list' && step.linkedList) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {step.linkedList.map((node, index) => (
          <React.Fragment key={node.id}>
            {renderNodeChip(node)}
            {index < (step.linkedList?.length || 0) - 1 && <span className="material-symbols-outlined text-gray-400 text-[18px]">trending_flat</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if ((step.kind === 'sequence' || step.kind === 'stack' || step.kind === 'queue') && step.sequence) {
    const isVertical = step.kind === 'stack';
    return (
      <div className={`flex ${isVertical ? 'flex-col-reverse items-center' : 'flex-wrap justify-center'} gap-2 md:gap-3`}>
        {step.sequence.map((node, index) => (
          <div key={node.id} className="relative flex flex-col items-center gap-1.5">
            {renderNodeChip(node)}
            <div className="min-h-4 flex flex-wrap items-center justify-center gap-1.5">
              {step.pointers?.filter(pointer => pointer.index === index).map(pointer => (
                <span key={pointer.key} className="inline-flex items-center gap-1 rounded-full bg-[#121121] border border-[#2e2b52] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-300">
                  <span className={`h-2 w-2 rounded-full ${pointer.color}`} />
                  {pointer.key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'tree' && step.treeLevels) {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {step.treeLevels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex items-center justify-center gap-3 md:gap-8">
            {level.map(node => (
              <div
                key={node.id}
                className={[
                  'size-12 md:size-14 rounded-full border flex items-center justify-center font-bold shadow-lg',
                  node.active
                    ? 'border-primary bg-primary text-white shadow-primary/25'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10',
                ].join(' ')}
              >
                {node.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'graph' && step.graphNodes && step.graphEdges) {
    return (
      <div className="relative w-full max-w-xl aspect-square rounded-3xl border border-gray-200 dark:border-[#272546] bg-white/60 dark:bg-[#151427] overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {step.graphEdges.map(edge => {
            const from = step.graphNodes?.find(node => node.id === edge.from);
            const to = step.graphNodes?.find(node => node.id === edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edge.active ? '#4236e7' : '#7c7a9f'}
                strokeWidth={edge.active ? 1.8 : 1}
              />
            );
          })}
        </svg>
        {step.graphNodes.map(node => (
          <div
            key={node.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 size-11 md:size-12 rounded-full border flex items-center justify-center font-bold ${node.active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 'bg-white dark:bg-[#1e1d32] border-gray-200 dark:border-[#272546] text-gray-900 dark:text-white'}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.label}
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'recursion' && step.callStack) {
    return (
      <div className="flex flex-col-reverse items-center gap-2 md:gap-3">
        {step.callStack.map(frame => (
          <div key={frame} className="min-w-[180px] md:min-w-[220px] rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-500 px-4 py-2.5 text-sm font-semibold text-center shadow-lg shadow-violet-500/10">
            {frame}
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'grid' && step.grid) {
    return (
      <div className="flex flex-col items-center gap-2">
        {step.grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center gap-1.5">
            {row.map((cell, colIndex) => {
              const isVisited = cell === 'V';
              const isLand = cell === '1' || isVisited;
              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`size-9 md:size-10 rounded-lg border text-xs font-bold flex items-center justify-center ${isVisited
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                    : isLand
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-gray-100 dark:bg-[#1f1d36] text-gray-500 dark:text-[#9794c7] border-gray-200 dark:border-[#272546]'
                  }`}
                >
                  {isVisited ? '1' : cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#383564] px-6 py-8 text-center text-sm text-gray-500 dark:text-[#9794c7]">
      No visualization state available for this step.
    </div>
  );
}

const LeetCodeProblemVisualizer: React.FC = () => {
  const { problemKey } = useParams<{ problemKey: string }>();
  const [problem, setProblem] = useState<RepoLeetcodeProblem | null>(null);
  const [details, setDetails] = useState<RepoReadmeDetails | null>(null);
  const [language, setLanguage] = useState<SolutionLanguage>('py');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.4);
  const [selectedExample, setSelectedExample] = useState(0);
  const [activePanel, setActivePanel] = useState<'code' | 'examples' | 'details'>('code');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const allProblems = await fetchAllLeetcodeRepoProblems();
        const found = allProblems.find(item => getProblemDetailPath(item).endsWith(`/${problemKey}`));
        if (!found || !alive) return;
        setProblem(found);
        const readme = await fetchLeetcodeReadmeDetails(found);
        if (!alive) return;
        setDetails(readme);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [problemKey]);

  useEffect(() => {
    if (!problem) return;
    let alive = true;

    const loadCode = async () => {
      setCode('');
      setCodeError(null);
      try {
        for (const url of getSolutionUrlCandidates(problem, language)) {
          const response = await fetch(url);
          if (!response.ok) continue;
          const text = await response.text();
          if (text.trim()) {
            if (!alive) return;
            setCode(text);
            return;
          }
        }
        if (alive) setCodeError(`No ${LANGUAGE_LABELS[language]} solution found for this problem.`);
      } catch {
        if (alive) setCodeError('Unable to fetch solution code for execution view.');
      }
    };

    loadCode();
    return () => {
      alive = false;
    };
  }, [problem, language]);

  const examples = useMemo(() => parseExamples(details?.markdown || ''), [details?.markdown]);
  const constraints = useMemo(() => parseConstraints(details?.markdown || ''), [details?.markdown]);
  const safeExamples = useMemo<ProblemExample[]>(() => {
    if (examples.length > 0) return examples;
    return problem ? [{ label: 'Default', input: problem.title, output: 'Conceptual run' }] : [];
  }, [examples, problem]);
  const activeExample = safeExamples[selectedExample] || safeExamples[0];
  const executionPlan = useMemo(() => {
    if (!problem || !details) return { steps: [], source: 'family' as const, confidence: 'low' as const };
    return buildExecutionPlan(problem, details, activeExample, code);
  }, [problem, details, activeExample, code]);
  const steps = executionPlan.steps;
  const activeStep = steps[currentStep] || steps[0];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedExample, language, code]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const timeout = window.setTimeout(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed * 1000);

    return () => window.clearTimeout(timeout);
  }, [isPlaying, speed, currentStep, steps.length]);

  const progressPercent = steps.length > 1 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const topic = problem?.topics[0] || 'arrays';
  const familyLabel = activeStep ? FAMILY_LABELS[activeStep.family] : 'Execution';
  const executionSourceLabel = executionPlan.source === 'specific' ? 'Specific Executor' : 'Family Executor';
  const confidenceLabel = executionPlan.confidence === 'high' ? 'High Confidence' : executionPlan.confidence === 'medium' ? 'Medium Confidence' : 'Low Confidence';

  const rightSidebar = problem && details ? (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 dark:border-[#272546] bg-gray-50/60 dark:bg-[#121121] px-3 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-gray-400">#{problem.id} · {TOPIC_LABELS[topic]}</p>
            <h2 className="truncate text-sm font-black text-gray-900 dark:text-white">{details.title}</h2>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[details.difficulty]}`}>
            {details.difficulty}
          </span>
        </div>
        <div className="mt-2 flex rounded-lg border border-gray-200 dark:border-[#383564] bg-white dark:bg-[#1c1a32] p-0.5">
          {(['code', 'examples', 'details'] as const).map(panel => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`flex-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${activePanel === panel ? 'bg-primary text-white' : 'text-gray-500 dark:text-[#9794c7] hover:text-primary'}`}
            >
              {panel}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-[#272546] px-3 py-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Current execution</p>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{activeStep?.title || 'Loading step'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              title={executionPlan.executorId ? `Executor: ${executionPlan.executorId}` : 'Pattern-matched family execution'}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${executionSourceLabel === 'Specific Executor' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] border-gray-200 dark:border-[#323055]'}`}
            >
              {executionSourceLabel}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${executionPlan.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : executionPlan.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {confidenceLabel}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
              {familyLabel}
            </span>
          </div>
        </div>
        <p className="text-xs leading-5 text-gray-600 dark:text-[#c9c7e5]">{activeStep?.detail || codeError || 'Loading solution lines...'}</p>
        {activeStep?.variables && activeStep.variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeStep.variables.map(variable => (
              <span key={`${variable.key}-${variable.value}`} className="rounded-full border border-gray-200 dark:border-[#323055] bg-gray-100 dark:bg-[#272546] px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-[#9794c7]">
                {variable.key}: {variable.value}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activePanel === 'code' && (
          <div className="h-full overflow-y-auto bg-[#0d0c1a] p-2 custom-scrollbar">
            {code ? (
              <div className="space-y-0.5 font-mono text-[11px] leading-5">
                {code.split('\n').map((line, index) => {
                  const lineNumber = index + 1;
                  const active = activeStep?.lineNumber === lineNumber;
                  return (
                    <div key={`${lineNumber}-${line}`} className={`grid grid-cols-[38px_1fr] gap-2 rounded-md px-2 py-1 ${active ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-white/5'}`}>
                      <span className={`text-right ${active ? 'text-primary font-bold' : 'text-gray-500'}`}>{lineNumber}</span>
                      <span className={`${active ? 'text-white' : 'text-gray-300'} whitespace-pre-wrap break-words`}>{line || ' '}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-3 text-xs text-gray-400">{codeError || 'Loading solution code...'}</p>
            )}
          </div>
        )}

        {activePanel === 'examples' && (
          <div className="h-full overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {safeExamples.map((example, index) => (
              <button
                key={example.label}
                onClick={() => setSelectedExample(index)}
                className={`w-full rounded-xl border px-3 py-3 text-left ${index === selectedExample ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1c1a32]'}`}
              >
                <p className="text-xs font-bold text-gray-900 dark:text-white">{example.label}</p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-[#9794c7] line-clamp-2">Input: {example.input}</p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-[#9794c7] line-clamp-2">Output: {example.output}</p>
              </button>
            ))}
          </div>
        )}

        {activePanel === 'details' && (
          <div className="h-full overflow-y-auto p-3 space-y-3 custom-scrollbar">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Tags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {details.tags.slice(0, 10).map(tag => (
                  <span key={tag} className="rounded-full border border-gray-200 dark:border-[#323055] bg-gray-100 dark:bg-[#272546] px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-[#9794c7]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {constraints.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Constraints</p>
                <div className="mt-2 space-y-1.5">
                  {constraints.map(item => (
                    <div key={item} className="rounded-lg bg-white dark:bg-[#1c1a32] border border-gray-200 dark:border-[#272546] px-3 py-2 text-[11px] text-gray-600 dark:text-[#c9c7e5]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Active example</p>
              <div className="mt-2 rounded-xl bg-white dark:bg-[#1c1a32] border border-gray-200 dark:border-[#272546] px-3 py-3 text-[11px] text-gray-600 dark:text-[#c9c7e5] space-y-2">
                <p><span className="font-bold text-gray-900 dark:text-white">Input:</span> {activeExample?.input}</p>
                <p><span className="font-bold text-gray-900 dark:text-white">Output:</span> {activeExample?.output}</p>
                {activeExample?.explanation && <p><span className="font-bold text-gray-900 dark:text-white">Why:</span> {activeExample.explanation}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-gray-500 dark:text-[#9794c7]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Loading problem visualizer...
        </div>
      </div>
    );
  }

  if (!problem || !details || !activeStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-6">
        <div className="max-w-xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
          Unable to build a visualizer for this problem right now.
          <div className="mt-4">
            <Link to="/leetcode" className="font-semibold underline">Back to LeetCode Hub</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{details.title} Visualizer | Data Structures Visualizer</title>
        <meta name="description" content={`Step through ${details.title} with synchronized code execution and a ${TOPIC_LABELS[topic]} visualization.`} />
      </Helmet>
      <VisualizationLayout
        title={`${details.title} Visualizer`}
        rightSidebar={rightSidebar}
        rightSidebarWidth={470}
        contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden p-0"
        controls={
          <div className="w-full h-16 bg-white dark:bg-[#1e1c33] border-t border-gray-200 dark:border-[#272546] flex items-center px-4 md:px-6 gap-4 z-20 shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <Link to={getProblemDetailPath(problem)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Back to problem">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <button onClick={() => setCurrentStep(0)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Start"><span className="material-symbols-outlined text-[18px]">skip_previous</span></button>
              <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Prev"><span className="material-symbols-outlined text-[18px]">fast_rewind</span></button>
              <button onClick={() => setIsPlaying(prev => !prev)} className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-primary'}`} title={isPlaying ? 'Pause' : 'Play'}>
                <span className="material-symbols-outlined text-[22px] filled">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <button onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Next"><span className="material-symbols-outlined text-[18px]">fast_forward</span></button>
              <button onClick={() => setCurrentStep(steps.length - 1)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="End"><span className="material-symbols-outlined text-[18px]">skip_next</span></button>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
              <div className="flex justify-between text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                <span className="text-primary/70">Step {currentStep + 1}/{steps.length || 1}</span>
                <span className="text-primary">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#272546] rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setCurrentStep(Math.max(0, Math.min(steps.length - 1, Math.floor(pct * steps.length))));
              }}>
                <div className="h-full bg-primary relative rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0 border-l border-[#272546] pl-4">
              <select value={selectedExample} onChange={e => setSelectedExample(Number(e.target.value))} className="bg-[#121121] border border-[#383564] rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-gray-300 outline-none">
                {safeExamples.map((example, index) => <option key={example.label} value={index}>{example.label}</option>)}
              </select>
              <select value={language} onChange={e => setLanguage(e.target.value as SolutionLanguage)} className="bg-[#121121] border border-[#383564] rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-gray-300 outline-none">
                {ALL_LANGUAGES.map(item => <option key={item} value={item}>{LANGUAGE_LABELS[item]}</option>)}
              </select>
            </div>

            <div className="hidden xl:flex items-center gap-3 w-40 shrink-0 border-l border-[#272546] pl-4">
              <span className="material-symbols-outlined text-gray-500 text-sm">speed</span>
              <input type="range" min="0.6" max="3" step="0.2" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full h-1 bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary" />
              <span className="text-xs font-mono text-gray-400 w-8 text-right shrink-0">{speed.toFixed(1)}x</span>
            </div>
          </div>
        }
      >
        <div className="flex w-full h-full relative overflow-hidden bg-gray-50 dark:bg-background-dark">
          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-[#272546] bg-white/80 dark:bg-[#1b1930]/80 backdrop-blur-sm px-4 py-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-gray-400">#{problem.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[details.difficulty]}`}>{details.difficulty}</span>
                  <span
                    title={executionPlan.executorId ? `Executor: ${executionPlan.executorId}` : 'Pattern-matched family execution'}
                    className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border ${executionSourceLabel === 'Specific Executor' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-500 dark:text-[#9794c7] bg-gray-100 dark:bg-[#272546] border-gray-200 dark:border-[#323055]'}`}
                  >
                    {executionSourceLabel}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border ${executionPlan.confidence === 'high' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : executionPlan.confidence === 'medium' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>{confidenceLabel}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{FAMILY_LABELS[activeStep.family]}</span>
                </div>
                <h1 className="truncate text-lg md:text-xl font-black text-gray-900 dark:text-white">{details.title}</h1>
                <p className="text-[11px] md:text-xs text-gray-500 dark:text-[#9794c7] truncate">
                  {activeStep.detail}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-[#9794c7] hover:text-primary">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  LeetCode
                </a>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[1fr_250px] overflow-hidden">
              <div className="min-h-0 flex flex-col overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-gray-200 dark:border-[#272546] bg-white/70 dark:bg-[#151427]/60 px-4 py-2 shrink-0">
                  <div className="rounded-xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Step</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{currentStep + 1} / {steps.length}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Line</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{activeStep.lineNumber}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Topic</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{TOPIC_LABELS[topic]}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">State</p>
                    <p className="truncate text-sm font-black text-gray-900 dark:text-white">{activeStep.stateLabel}</p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 p-4 overflow-auto">
                  <div className="h-full min-h-[360px] rounded-3xl border border-gray-200 dark:border-[#272546] bg-white/80 dark:bg-[#1e1d32]/90 p-4 md:p-6 shadow-xl flex items-center justify-center overflow-auto">
                    <VisualizationSurface step={activeStep} />
                  </div>
                </div>
              </div>

              <div className="min-h-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-[#272546] bg-white/70 dark:bg-[#151427]/60 p-3 overflow-y-auto custom-scrollbar space-y-3">
                <div className="rounded-2xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Variables</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(activeStep.variables && activeStep.variables.length > 0 ? activeStep.variables : [{ key: 'example', value: activeExample?.label || 'Default' }]).map(variable => (
                      <span key={`${variable.key}-${variable.value}`} className="rounded-full border border-gray-200 dark:border-[#323055] bg-gray-100 dark:bg-[#272546] px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-[#9794c7]">
                        {variable.key}: {variable.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Example</p>
                  <div className="mt-2 space-y-2 text-[11px] text-gray-600 dark:text-[#c9c7e5]">
                    <p><span className="font-bold text-gray-900 dark:text-white">Input:</span> {activeExample?.input}</p>
                    <p><span className="font-bold text-gray-900 dark:text-white">Output:</span> {activeExample?.output}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Constraints</p>
                  <div className="mt-2 space-y-1.5">
                    {constraints.slice(0, 4).map(item => (
                      <p key={item} className="text-[11px] text-gray-600 dark:text-[#c9c7e5]">• {item}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Timeline</p>
                  <div className="mt-2 max-h-[260px] space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(index)}
                        className={`w-full rounded-xl border px-2.5 py-2 text-left transition-colors ${index === currentStep ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-[#272546] bg-gray-50 dark:bg-[#131221]/60 hover:border-primary/40'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold text-gray-900 dark:text-white">Line {step.lineNumber}</p>
                            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-[#9794c7] line-clamp-2">{step.detail}</p>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-[#4a4868]'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VisualizationLayout>
    </>
  );
};

export default LeetCodeProblemVisualizer;
