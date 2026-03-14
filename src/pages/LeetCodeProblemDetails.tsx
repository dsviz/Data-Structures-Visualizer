import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { LeetcodeDifficulty } from '../data/LeetcodeProblems';
import { SolutionViewer } from '../components/ui/SolutionViewer';
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

const LeetCodeProblemDetails: React.FC = () => {
  const { problemKey } = useParams<{ problemKey: string }>();
  const [problem, setProblem] = useState<RepoLeetcodeProblem | null>(null);
  const [details, setDetails] = useState<RepoReadmeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProblem, setActiveProblem] = useState<RepoLeetcodeProblem | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const problems = await fetchAllLeetcodeRepoProblems();
        const found = problems.find(p => getProblemDetailPath(p).endsWith(`/${problemKey}`));

        if (!found) {
          if (alive) setError('Problem not found in repository index.');
          return;
        }

        if (!alive) return;
        setProblem(found);

        const readmeDetails = await fetchLeetcodeReadmeDetails(found);
        if (!alive) return;
        setDetails(readmeDetails);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load problem details.');
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [problemKey]);

  const title = useMemo(() => details?.title || problem?.title || 'LeetCode Problem', [details, problem]);
  const rawDifficulty = details?.difficulty || problem?.difficulty || 'Medium';
  const difficulty: LeetcodeDifficulty = rawDifficulty in DIFFICULTY_STYLES ? rawDifficulty as LeetcodeDifficulty : 'Medium';
  const tags = details?.tags || problem?.tags || [];

  return (
    <div className="flex-grow bg-background-light dark:bg-background-dark min-h-screen">
      <Helmet>
        <title>{title} | LeetCode Problem Details</title>
      </Helmet>

      <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to="/leetcode"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to LeetCode Hub
          </Link>

          {problem && (
            <Link
              to={getProblemVisualizationPath(problem)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-indigo-600"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Visualize This Problem
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-500 dark:text-[#9794c7]">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-3" />
            Loading problem details...
          </div>
        ) : error || !problem ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 p-6">
            {error || 'Problem not found.'}
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-6 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">#{problem.id}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[difficulty]}`}>
                      {difficulty}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveProblem(problem)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">code</span>
                    View Solution
                  </button>
                  <a
                    href={`https://leetcode.com/problems/${problem.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-white dark:bg-[#272546] border border-gray-200 dark:border-[#383564] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open on LeetCode
                  </a>
                  <a
                    href={problem.githubFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-white dark:bg-[#272546] border border-gray-200 dark:border-[#383564] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open on GitHub
                  </a>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-[#272546] border border-gray-200 dark:border-[#323055] text-gray-600 dark:text-[#9794c7]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <article className="rounded-2xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] p-6 md:p-8 overflow-hidden">
              {details?.markdown ? (
                <div className="markdown-body text-gray-800 dark:text-gray-200 leading-7">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rehypePlugins={[rehypeRaw as any, rehypeKatex]}
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-black mt-2 mb-5 text-gray-900 dark:text-white">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 text-gray-700 dark:text-gray-300 whitespace-normal">{children}</p>,
                      li: ({ children }) => <li className="mb-1 ml-6">{children}</li>,
                      ul: ({ children }) => <ul className="list-disc mb-4 text-gray-700 dark:text-gray-300">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal mb-4 ml-6 text-gray-700 dark:text-gray-300">{children}</ol>,
                      code: ({ className, children }) => {
                        const isBlock = className?.includes('language-') || className?.includes('math-display');
                        if (isBlock) {
                          return (
                            <code className="block whitespace-pre overflow-x-auto rounded-xl bg-[#0d0c1a] text-gray-200 p-4 text-xs leading-6">
                              {children}
                            </code>
                          );
                        }
                        return <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#272546] text-pink-500 text-sm font-mono">{children}</code>;
                      },
                      pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {children}
                        </a>
                      ),
                      img: ({ src, alt }) => (
                        <img src={src || ''} alt={alt || ''} className="rounded-xl border border-gray-200 dark:border-[#272546] my-4 max-w-full" />
                      ),
                      table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                      thead: ({ children }) => <thead className="bg-gray-100 dark:bg-[#272546]">{children}</thead>,
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr className="border-b border-gray-200 dark:border-[#383564]">{children}</tr>,
                      th: ({ children }) => <th className="text-left px-3 py-2 font-bold text-gray-900 dark:text-white">{children}</th>,
                      td: ({ children }) => <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{children}</td>,
                      strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                      span: ({ className, children }) => {
                        if (className?.includes('katex')) {
                          return <span className={className}>{children}</span>;
                        }
                        return <span className={className}>{children}</span>;
                      },
                    }}
                  >
                    {details.markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-[#9794c7]">README content not available.</p>
              )}
            </article>
          </>
        )}
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

export default LeetCodeProblemDetails;
