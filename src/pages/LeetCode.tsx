import React, { useEffect, useMemo, useState } from 'react';
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
  fetchAllLeetcodeRepoProblems,
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
  'queue': 'queue_segment',
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
  const [problems, setProblems] = useState<RepoLeetcodeProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || String(p.id).includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q))
        || p.slug.includes(q);

      return matchTopic && matchDiff && matchSearch;
    });
  }, [problems, activeTopic, activeDifficulty, searchQuery]);

  return (
    <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      <Helmet>
        <title>LeetCode Practice Hub | Data Structures Visualizer</title>
        <meta name="description" content="Browse all available LeetCode problems from repository, open README details, view multi-language solutions, and visualize concepts." />
      </Helmet>

      <section className="relative py-14 px-6 overflow-hidden">
        <AuthBackground isFixed={false} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">local_library</span>
            LeetCode Practice Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Solve, Read, and{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Visualize
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-[#9794c7] max-w-2xl mx-auto">
            Live catalog from GitHub repository. Every card opens a problem detail page with README description, examples, constraints, and solutions.
          </p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(problem => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  onViewSolution={() => setActiveProblem(problem)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {activeProblem && (
        <SolutionViewer
          problem={activeProblem}
          onClose={() => setActiveProblem(null)}
        />
      )}
    </div>
  );
};

const ProblemCard: React.FC<{
  problem: RepoLeetcodeProblem;
  onViewSolution: () => void;
}> = ({ problem, onViewSolution }) => {
  const navigate = useNavigate();
  const primaryTopic = problem.topics[0] || 'arrays';

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
      className="group flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.12)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      title="Open problem details"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${TOPIC_GRADIENT[primaryTopic]}`} />

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-mono text-gray-400">#{problem.id}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {problem.title}
            </h3>
          </div>
          <div className={`shrink-0 size-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${TOPIC_GRADIENT[primaryTopic]}`}>
            <span className="material-symbols-outlined text-white text-[16px]">{TOPIC_ICONS[primaryTopic]}</span>
          </div>
        </div>

        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] border border-gray-200 dark:border-[#323055]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewSolution();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">code</span>
            Solution
          </button>

          {problem && (
            <Link
              to={getProblemVisualizationPath(problem)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              Visualize
            </Link>
          )}
        </div>

        <p className="text-[10px] text-gray-400 dark:text-[#9794c7] mt-1">Click card to open full README details</p>
      </div>
    </div>
  );
};

export default LeetCode;
