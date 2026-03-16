import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  SolutionLanguage,
  ALL_LANGUAGES,
  LANGUAGE_LABELS,
} from '../../data/LeetcodeProblems';
import { getProblemVisualizationPath } from '../../services/leetcodeRepoService';

import {
  RepoLeetcodeProblem,
  RepoReadmeDetails,
} from '../../services/leetcodeRepoService';

interface SolutionViewerProps {
  problem: RepoLeetcodeProblem;
  details: RepoReadmeDetails;
  onClose: () => void;
}

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const SolutionViewer: React.FC<SolutionViewerProps> = ({ problem, details, onClose }) => {
  const [language, setLanguage] = useState<SolutionLanguage>('py');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const extractSolutionFromMarkdown = useCallback((markdown: string, lang: SolutionLanguage) => {
    // Map internal language codes to markdown labels used in the LeetCode repository
    const langMarkdownMap: Record<SolutionLanguage, string[]> = {
      py: ['Python3', 'Python'],
      js: ['JavaScript'],
      ts: ['TypeScript'],
      java: ['Java'],
      cpp: ['C++'],
      go: ['Go'],
      rs: ['Rust'],
      cs: ['C#'],
      kt: ['Kotlin'],
      swift: ['Swift'],
      rb: ['Ruby'],
    };

    const targetLabels = langMarkdownMap[lang] || [];
    let foundCode = '';

    for (const label of targetLabels) {
      const headerIndex = markdown.toLowerCase().indexOf(`#### ${label.toLowerCase()}`);
      if (headerIndex !== -1) {
        const codeBlockStart = markdown.indexOf('```', headerIndex);
        if (codeBlockStart !== -1) {
          const codeContentStart = markdown.indexOf('\n', codeBlockStart);
          if (codeContentStart !== -1) {
            const codeBlockEnd = markdown.indexOf('```', codeContentStart + 1);
            if (codeBlockEnd !== -1) {
              foundCode = markdown.substring(codeContentStart + 1, codeBlockEnd).trim();
              break;
            }
          }
        }
      }
    }

    if (!foundCode) {
      setError(`No ${LANGUAGE_LABELS[lang]} solution found in the problem description.`);
      setCode('');
    } else {
      setError(null);
      setCode(foundCode);
    }
  }, []);

  useEffect(() => {
    extractSolutionFromMarkdown(details.markdown, language);
  }, [language, details.markdown, extractSolutionFromMarkdown]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  // Cleanup pending copy timer on unmount
  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-[#272546] shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-gray-400 dark:text-[#9794c7] font-mono">#{problem.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
              {problem.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] border border-gray-200 dark:border-[#323055]">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{problem.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 dark:border-[#272546] shrink-0 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-400 dark:text-[#9794c7] font-medium shrink-0">Language:</span>
          <div className="flex gap-1">
            {ALL_LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap transition-colors ${
                  language === lang
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-200 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 overflow-auto bg-[#0d0c1a] relative min-h-0">
          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-600">code_off</span>
              <p className="text-gray-400 text-sm font-mono">{error}</p>
              <p className="text-gray-600 text-xs">Try a different language.</p>
            </div>
          )}

          {!error && code && (
            <pre className="p-5 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre">
              {code}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-[#272546] bg-gray-50 dark:bg-[#131221]/60 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!code}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-[#272546] border border-gray-200 dark:border-[#383564] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#323055] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <a
              href={`https://leetcode.com/problems/${problem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-[#272546] border border-gray-200 dark:border-[#383564] text-gray-600 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#323055] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Open in LeetCode
            </a>
          </div>

          {problem && (
            <Link
              to={getProblemVisualizationPath(problem)}
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Visualize This Concept
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
