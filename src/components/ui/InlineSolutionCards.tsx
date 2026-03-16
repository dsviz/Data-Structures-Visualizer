import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SolutionLanguage, ALL_LANGUAGES, LANGUAGE_LABELS } from '../../data/LeetcodeProblems';

import pyIcon from '../../assets/icons/py.svg';
import jsIcon from '../../assets/icons/js.svg';
import tsIcon from '../../assets/icons/ts.svg';
import javaIcon from '../../assets/icons/java.svg';
import cppIcon from '../../assets/icons/cpp.svg';
import goIcon from '../../assets/icons/go.svg';
import rsIcon from '../../assets/icons/rs.svg';
import csIcon from '../../assets/icons/cs.svg';
import ktIcon from '../../assets/icons/kt.svg';
import swiftIcon from '../../assets/icons/swift.svg';
import rbIcon from '../../assets/icons/rb.svg';

interface InlineSolutionCardsProps {
  solutionsMarkdown: string;
}

interface ParsedApproach {
  id: string;
  title: string;
  description: string;
  solutions: { lang: SolutionLanguage; code: string }[];
}

export const LanguageIcon: React.FC<{ lang: string; className?: string }> = ({ lang, className = 'w-8 h-8' }) => {
  const iconMap: Record<string, string> = {
    py: pyIcon,
    js: jsIcon,
    ts: tsIcon,
    java: javaIcon,
    cpp: cppIcon,
    go: goIcon,
    rs: rsIcon,
    cs: csIcon,
    kt: ktIcon,
    swift: swiftIcon,
    rb: rbIcon,
  };

  const iconSrc = iconMap[lang];

  if (!iconSrc) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
      </svg>
    );
  }

  return (
    <img 
      src={iconSrc} 
      alt={`${lang} icon`} 
      className={className} 
    />
  );
};

export const InlineSolutionCards: React.FC<InlineSolutionCardsProps> = ({ solutionsMarkdown }) => {
  const [activeLangPerApproach, setActiveLangPerApproach] = useState<Record<string, SolutionLanguage | null>>({});
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Parse markdown into distinct approaches
  const parsedApproaches = useMemo(() => {
    const approaches: ParsedApproach[] = [];
    
    // Some markdown files don't have "### Approach 1", they just have "### Solution 1" or similar
    // Let's split by `### `
    const sections = solutionsMarkdown.split(/(?=\n###\s+)/);
    
    // If the split didn't find any '### ', it means there are no approaches explicitly listed.
    // In this case, we'll treat the whole thing as one approach.
    const sectionsToProcess = sections.length > 1 ? sections.filter(s => s.trim().startsWith('###')) : [solutionsMarkdown];

    for (let i = 0; i < sectionsToProcess.length; i++) {
        let section = sectionsToProcess[i].trim();
        let title = "Approach 1";
        
        if (section.startsWith('### ')) {
            const lines = section.split('\n');
            // Strip "Solution 1: ", "Solution 2: ", etc. if they exist in the title
            title = lines[0].replace('### ', '').replace(/Solution\s+\d+:\s*/i, '').trim();
            section = lines.slice(1).join('\n');
        }
        
        // Split out languages within this approach
        const langSections = section.split(/(?=\n####\s+)/);
        const desc = langSections.length > 0 && !langSections[0].trim().startsWith('####') 
            ? langSections[0].trim() 
            : '';
        
        const solutions = ALL_LANGUAGES.map(lang => {
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
            for (const label of targetLabels) {
                // Search for "#### Python3" or similar safely
                const searchStr = `#### ${label}`.toLowerCase();
                const matchIndex = section.toLowerCase().indexOf(searchStr);
                
                if (matchIndex !== -1) {
                    const codeBlockStart = section.indexOf('```', matchIndex);
                    if (codeBlockStart !== -1) {
                        const codeContentStart = section.indexOf('\n', codeBlockStart);
                        if (codeContentStart !== -1) {
                            const codeBlockEnd = section.indexOf('```', codeContentStart + 1);
                            if (codeBlockEnd !== -1) {
                                return {
                                    lang,
                                    code: section.substring(codeContentStart + 1, codeBlockEnd).trim()
                                };
                            }
                        }
                    }
                }
            }
            return null;
        }).filter(Boolean) as { lang: SolutionLanguage; code: string }[];
        
        if (solutions.length > 0) {
            approaches.push({
                id: `approach-${i}`,
                title,
                description: desc,
                solutions
            });
        }
    }
    
    return approaches;
  }, [solutionsMarkdown]);

  const handleCopy = async (code: string) => {
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

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  if (parsedApproaches.length === 0) {
    return null; // Don't show anything if no solutions could be parsed
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#272546]">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Solutions</h2>
      
      <div className="flex flex-col gap-6">
        {parsedApproaches.map((approach, index) => {
          const activeLang = activeLangPerApproach[approach.id] || null;
          const activeSolution = approach.solutions.find(s => s.lang === activeLang);
          
          return (
            <div key={approach.id} className="space-y-6">
              <div>
                 <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    <span className="text-primary mr-2">Approach {index + 1}:</span>
                    {approach.title}
                 </h3>
                 {approach.description && (
                   <div className="text-gray-700 dark:text-gray-300 markdown-body prose-sm dark:prose-invert">
                     <ReactMarkdown 
                       remarkPlugins={[remarkMath]} 
                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                       rehypePlugins={[rehypeKatex as any]}
                       components={{
                         p: ({ children }) => <p className="mb-4 break-words">{children}</p>,
                         code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#272546] text-pink-500 font-mono">{children}</code>,
                         pre: ({ children }) => (
                           <pre className="mb-4 overflow-x-auto rounded-xl bg-[#0d0c1a] text-gray-200 p-4 text-xs leading-6 scrollbar-hide">
                             {children}
                           </pre>
                         )
                       }}
                     >
                       {approach.description}
                     </ReactMarkdown>
                   </div>
                 )}
              </div>
              
              {!activeLang ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {approach.solutions.map(({ lang }) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLangPerApproach(prev => ({ ...prev, [approach.id]: lang }))}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gray-50 dark:bg-[#272546] border border-gray-200 dark:border-[#323055] hover:border-primary/50 hover:bg-white dark:hover:bg-[#323055] hover:shadow-lg hover:shadow-primary/10 transition-colors"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-white dark:bg-[#1e1d32] shadow-sm relative">
                        <LanguageIcon lang={lang} className="w-8 h-8 rounded-sm" />
                      </div>
                      <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                        {LANGUAGE_LABELS[lang]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#0d0c1a] border border-[#272546] overflow-hidden flex flex-col shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between p-4 border-b border-[#272546] bg-[#1a192e]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setActiveLangPerApproach(prev => ({ ...prev, [approach.id]: null }))}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#272546] rounded-lg transition-colors flex items-center gap-1"
                        title="Back to all languages"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="text-xs font-semibold">Back</span>
                      </button>
                      <div className="h-4 w-px bg-[#383564]" />
                      <div className="flex items-center gap-2">
                        <LanguageIcon lang={activeLang} className="w-4 h-4" />
                        <span className="text-sm font-bold text-white">
                          {LANGUAGE_LABELS[activeLang]}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Solution</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => activeSolution && handleCopy(activeSolution.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#272546] text-gray-300 hover:text-white hover:bg-[#323055] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  
                  <div className="p-5 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre">
                      {activeSolution?.code}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
