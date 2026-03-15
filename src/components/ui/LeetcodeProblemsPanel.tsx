import React, { useEffect, useMemo, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAiContextStore } from '../../store/aiContextStore';
import {
  LeetcodeDifficulty,
  DS_TO_TOPIC,
  TOPIC_LABELS,
} from '../../data/LeetcodeProblems';
import { SolutionViewer } from './SolutionViewer';
import {
  RepoLeetcodeProblem,
  RepoReadmeDetails,
  fetchAllLeetcodeRepoProblems,
  fetchLeetcodeReadmeDetails,
  getProblemDetailPath,
  getProblemVisualizationPath,
} from '../../services/leetcodeRepoService';

const DIFFICULTY_STYLES: Record<LeetcodeDifficulty, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const LeetcodeProblemsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProblem, setActiveProblem] = useState<RepoLeetcodeProblem | null>(null);
  const [activeProblemDetails, setActiveProblemDetails] = useState<RepoReadmeDetails | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<LeetcodeDifficulty | 'All'>('All');
  const [allRepoProblems, setAllRepoProblems] = useState<RepoLeetcodeProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const dataStructure = useAiContextStore(state => state.dataStructure);
  const topicKey = dataStructure ? DS_TO_TOPIC[dataStructure] : null;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const all = await fetchAllLeetcodeRepoProblems();
        if (!alive) return;
        setAllRepoProblems(all);
      } catch (e) {
        if (alive) setLoadError(e instanceof Error ? e.message : 'Failed to load problems.');
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const allProblems = useMemo(
    () => (topicKey ? allRepoProblems.filter(p => p.topics.includes(topicKey)) : []),
    [allRepoProblems, topicKey]
  );

  const problems = useMemo(() => {
    const scoped = filterDifficulty === 'All'
      ? allProblems
      : allProblems.filter(p => p.difficulty === filterDifficulty);

    return scoped.slice(0, 80);
  }, [allProblems, filterDifficulty]);

  if (!topicKey) return null;

  return (
    <>
      <div className="fixed bottom-6 right-[4.5rem] z-[90] flex flex-col items-end gap-3">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          title="LeetCode Problems"
          className={`group flex items-center gap-2 rounded-full shadow-lg transition-all duration-200 active:scale-95
            ${isOpen
              ? 'bg-orange-500 text-white px-4 py-3 shadow-orange-500/30'
              : 'bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:border-orange-500/50 hover:shadow-orange-500/20 px-3 py-3'
            }`}
        >
          <span className="material-symbols-outlined text-[22px]">local_library</span>
          {isOpen && <span className="text-sm font-bold">Problems</span>}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-0 right-0 z-[80] w-80 h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#1e1d32] border-l border-t border-gray-200 dark:border-[#272546] shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#272546] shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-orange-400">local_library</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">LeetCode Problems</h3>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-[#9794c7] mt-0.5">
                {TOPIC_LABELS[topicKey]} · {allProblems.length} problems
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-200 dark:border-[#272546] shrink-0">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  filterDifficulty === d
                    ? d === 'All' ? 'bg-primary text-white'
                      : d === 'Easy' ? 'bg-emerald-500 text-white'
                        : d === 'Medium' ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-200 dark:hover:bg-[#323055]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
            {isLoading ? (
              <p className="text-center text-xs text-gray-400 dark:text-[#9794c7] mt-8">Loading problems...</p>
            ) : loadError ? (
              <p className="text-center text-xs text-red-400 mt-8 px-2">{loadError}</p>
            ) : problems.length === 0 ? (
              <p className="text-center text-xs text-gray-400 dark:text-[#9794c7] mt-8">No problems found.</p>
            ) : (
              problems.map(problem => (
                <MemoizedPanelCard
                  key={problem.id}
                  problem={problem}
                  onViewSolution={async () => {
                    try {
                      const details = await fetchLeetcodeReadmeDetails(problem);
                      setActiveProblem(problem);
                      setActiveProblemDetails(details);
                    } catch (e) {
                      console.error('Error fetching details for solution', e);
                    }
                  }}
                />
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-[#272546] shrink-0">
            <Link
              to="/leetcode"
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-primary hover:text-indigo-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              Browse Full LeetCode Hub
            </Link>
          </div>
        </div>
      )}

      {activeProblem && activeProblemDetails && (
        <SolutionViewer
          problem={activeProblem}
          details={activeProblemDetails}
          onClose={() => {
            setActiveProblem(null);
            setActiveProblemDetails(null);
          }}
        />
      )}
    </>
  );
};

const MemoizedPanelCard = memo(({ 
  problem, 
  onViewSolution 
}: { 
  problem: RepoLeetcodeProblem; 
  onViewSolution: () => void; 
}) => {
  return (
    <div className="group flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-[#131221]/60 border border-gray-200 dark:border-[#272546] hover:border-orange-400/50 dark:hover:border-orange-400/30 transition-colors">
      <Link
        to={getProblemDetailPath(problem)}
        className="flex items-start justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono text-gray-400">#{problem.id}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {problem.title}
          </p>
        </div>
      </Link>

      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {problem.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] border border-gray-200 dark:border-[#323055]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          onClick={onViewSolution}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">code</span>
          Solution
        </button>
        {problem && (
          <Link
            to={getProblemVisualizationPath(problem)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            Visualize
          </Link>
        )}
      </div>
    </div>
  );
});
