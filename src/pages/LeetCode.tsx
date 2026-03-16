import React, { useEffect, useMemo, useState, useDeferredValue, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  LeetcodeDifficulty,
  LeetcodeTopic,
  TOPIC_LABELS,
} from '../data/LeetcodeProblems';
import { SolutionViewer } from '../components/ui/SolutionViewer';
import AuthBackground from '../components/auth/AuthBackground';
import {
  RepoLeetcodeProblem,
  RepoReadmeDetails,
  fetchAllLeetcodeRepoProblems,
  fetchLeetcodeReadmeDetails,
  getProblemDetailPath,
  getProblemVisualizationPath,
} from '../services/leetcodeRepoService';

const DIFFICULTY_STYLES: Record<LeetcodeDifficulty, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TOPIC_ICONS: Record<LeetcodeTopic, string> = {
  'arrays': 'data_array',
  'linked-list': 'link',
  'stack': 'layers',
  'queue': 'linear_scale',
  'trees': 'account_tree',
  'graphs': 'hub',
  'sorting': 'bar_chart',
  'recursion': 'all_inclusive',
};

const TOPIC_GRADIENT: Record<LeetcodeTopic, string> = {
  'arrays': 'from-pink-500 to-rose-500',
  'linked-list': 'from-blue-500 to-cyan-500',
  'stack': 'from-amber-500 to-orange-600',
  'queue': 'from-sky-500 to-blue-600',
  'trees': 'from-emerald-500 to-teal-500',
  'graphs': 'from-orange-500 to-red-500',
  'sorting': 'from-indigo-500 to-purple-600',
  'recursion': 'from-violet-500 to-fuchsia-500',
};

const ALL_TOPICS: LeetcodeTopic[] = ['arrays', 'linked-list', 'stack', 'queue', 'trees', 'graphs', 'sorting', 'recursion'];

const LeetCode: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<LeetcodeTopic | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<LeetcodeDifficulty | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProblem, setActiveProblem] = useState<RepoLeetcodeProblem | null>(null);
  const [activeProblemDetails, setActiveProblemDetails] = useState<RepoReadmeDetails | null>(null);
  const [problems, setProblems] = useState<RepoLeetcodeProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [displayCount, setDisplayCount] = useState(60);

  // Debounced search to prevent UI freezing on typing over 3700 items
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const all = await fetchAllLeetcodeRepoProblems();
        if (!alive) return;
        setProblems(all);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load LeetCode catalog from GitHub.');
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const easyCount = useMemo(() => problems.filter(p => p.difficulty === 'Easy').length, [problems]);
  const mediumCount = useMemo(() => problems.filter(p => p.difficulty === 'Medium').length, [problems]);
  const hardCount = useMemo(() => problems.filter(p => p.difficulty === 'Hard').length, [problems]);

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchTopic = activeTopic === 'all' || p.topics.includes(activeTopic as LeetcodeTopic);
      const matchDiff = activeDifficulty === 'All' || p.difficulty === activeDifficulty;
      const q = deferredSearchQuery.trim().toLowerCase();
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || String(p.id).includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q))
        || p.slug.includes(q);

      return matchTopic && matchDiff && matchSearch;
    });
  }, [problems, activeTopic, activeDifficulty, deferredSearchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(60);
  }, [activeTopic, activeDifficulty, deferredSearchQuery]);

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark">
      <Helmet>
        <title>LeetCode Practice Hub | Data Structures Visualizer</title>
        <meta name="description" content="Browse all available LeetCode problems from repository, open README details, view multi-language solutions, and visualize concepts." />
      </Helmet>

      <section className="relative py-16 px-6 overflow-hidden">
        <AuthBackground isFixed={false} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-900/70 dark:from-white dark:to-white/70">
              Solve, Read, and{' '}
              <span className="text-slate-900 dark:text-white">
                Visualize
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#9794c7] max-w-2xl mx-auto font-light">
              Live catalog from GitHub repository. Every card opens a problem detail page with README description, examples, constraints, and solutions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">library_books</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{problems.length} Problems</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-sm font-bold text-emerald-400">{easyCount} Easy</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <span className="text-sm font-bold text-yellow-400">{mediumCount} Medium</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span className="text-sm font-bold text-red-400">{hardCount} Hard</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTopic('all')}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                activeTopic === 'all'
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                  : 'bg-white dark:bg-[#1e1d32] border-gray-200 dark:border-[#272546] text-gray-600 dark:text-[#9794c7] hover:border-primary/50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">all_inclusive</span>
              All Topics
              <span className="text-xs font-mono opacity-70">{problems.length}</span>
            </button>
            {ALL_TOPICS.map(topic => {
              const count = problems.filter(p => p.topics.includes(topic)).length;
              return (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    activeTopic === topic
                      ? `bg-gradient-to-r ${TOPIC_GRADIENT[topic]} text-white border-transparent shadow-lg`
                      : 'bg-white dark:bg-[#1e1d32] border-gray-200 dark:border-[#272546] text-gray-600 dark:text-[#9794c7] hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{TOPIC_ICONS[topic]}</span>
                  {TOPIC_LABELS[topic]}
                  <span className="text-xs font-mono opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search problems, tags, slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1d32] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9794c7] focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#272546] border border-gray-200 dark:border-transparent">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDifficulty(d)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeDifficulty === d
                      ? d === 'All' ? 'bg-white dark:bg-[#1e1d32] text-gray-900 dark:text-white shadow-sm'
                        : d === 'Easy' ? 'bg-emerald-500 text-white shadow-sm'
                          : d === 'Medium' ? 'bg-yellow-500 text-white shadow-sm'
                            : 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-400 dark:text-[#9794c7] font-mono ml-auto">
              {filtered.length} results
            </span>
          </div>
        </div>
      </section>

      <section className="flex-1 px-6 pb-12">
        <div className="max-w-[1400px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-gray-500 dark:text-[#9794c7]">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading repository problem catalog...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 p-6 text-center">
              <p>{error}</p>
              <button
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const all = await fetchAllLeetcodeRepoProblems(true);
                    setProblems(all);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Unable to reload problem catalog.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="mt-3 text-sm font-semibold text-white/90 hover:text-white underline"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">search_off</span>
              <p className="text-gray-500 dark:text-[#9794c7]">No problems match your filters.</p>
              <button
                onClick={() => { setActiveTopic('all'); setActiveDifficulty('All'); setSearchQuery(''); }}
                className="text-primary text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.slice(0, displayCount).map(problem => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    onViewSolution={async () => {
                      try {
                        const details = await fetchLeetcodeReadmeDetails(problem);
                        setActiveProblem(problem);
                        setActiveProblemDetails(details);
                      } catch (e) {
                        console.error('Error fetching details for solution', e);
                        alert('Could not load solution data.');
                      }
                    }}
                  />
                ))}
              </div>
              
              {displayCount < filtered.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 60)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] text-sm font-bold text-gray-900 dark:text-white hover:border-primary/50 hover:text-primary transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:animate-bounce">expand_more</span>
                    Load More Exercises
                    <span className="text-xs text-gray-500 dark:text-[#9794c7] font-mono ml-1">
                      ({filtered.length - displayCount} remaining)
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
    </div>
  );
};

const ProblemCard: React.FC<{
  problem: RepoLeetcodeProblem;
  onViewSolution: () => Promise<void>;
}> = memo(({ problem, onViewSolution }) => {
  const navigate = useNavigate();
  const primaryTopic = problem.topics[0] || 'arrays';
  const [isOpeningSolution, setIsOpeningSolution] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(getProblemDetailPath(problem))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(getProblemDetailPath(problem));
        }
      }}
      className="group flex flex-col bg-[#1e1d32] border border-[#272546] rounded-2xl p-4 gap-4 hover:border-primary/40 hover:shadow-xl hover:shadow-[0_0_30px_rgba(66,54,231,0.12)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
      title="Open problem details"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">#{problem.id}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border bg-transparent ${DIFFICULTY_STYLES[problem.difficulty].split(' ')[1]} ${DIFFICULTY_STYLES[problem.difficulty].split(' ')[2]}`}>
              {problem.difficulty}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-[#807fe2] leading-snug pr-8 mt-1 group-hover:text-[#908ff2] transition-colors">
            {problem.title}
          </h3>
        </div>
        <div className={`absolute top-4 right-4 shrink-0 size-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br ${TOPIC_GRADIENT[primaryTopic]} shadow-lg`}>
          <span className="material-symbols-outlined text-white text-[20px]">{TOPIC_ICONS[primaryTopic]}</span>
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            setIsOpeningSolution(true);
            await onViewSolution();
            setIsOpeningSolution(false);
          }}
          disabled={isOpeningSolution}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-[#362f3a] text-orange-500 hover:bg-[#463a43] hover:text-orange-400 transition-colors disabled:opacity-50"
        >
          {isOpeningSolution ? (
            <span className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[16px] font-bold">code</span>
          )}
          Solution
        </button>

        <Link
          to={getProblemVisualizationPath(problem)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-[#26254a] text-primary hover:bg-[#322f60] hover:text-[#807fe2] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          Visualize
        </Link>
      </div>
    </div>
  );
});

export default LeetCode;
