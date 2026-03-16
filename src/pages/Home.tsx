import { useMemo, useRef, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { DASHBOARD_CARDS } from '../data/learningPaths' // Changed import
import AuthBackground from '../components/auth/AuthBackground'
import { LEETCODE_PROBLEMS, LeetcodeProblem, LeetcodeTopic, LeetcodeDifficulty, TOPIC_LABELS } from '../data/LeetcodeProblems'
import { SolutionViewer } from '../components/ui/SolutionViewer'
import { RepoReadmeDetails, fetchLeetcodeReadmeDetails, getProblemVisualizationPath } from '../services/leetcodeRepoService'

type DashboardCardView = {
  title: string
  path: string
  description: string
  tags: string[]
  difficulty: string
  count: number
  countLabel: string
  icon: string
  gradientFrom: string
  gradientTo: string
  darkGradientFrom?: string | null
  darkGradientTo?: string | null
  iconColor: string
  darkIconColor?: string | null
  pattern: string
  alt: string
  isPlaceholder: boolean
  image?: string
  imageBg?: string
}

const Home = () => {
  // const { algorithms, isLoading, error } = useCatalog() // Removed
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mode, setMode] = useState<'training' | 'visualizer'>('visualizer');
  const contentSectionRef = useRef<HTMLElement>(null);
  const [activeProblem, setActiveProblem] = useState<LeetcodeProblem | null>(null);
  const [activeProblemDetails, setActiveProblemDetails] = useState<RepoReadmeDetails | null>(null);
  const [trainingDifficulty, setTrainingDifficulty] = useState<LeetcodeDifficulty | 'All'>('All');

  const dashboardCards: DashboardCardView[] = useMemo(() => {
    return DASHBOARD_CARDS.map(card => ({
      title: card.title,
      path: card.path,
      description: card.description,
      tags: card.category,
      difficulty: card.difficulty,
      count: card.count,
      countLabel: card.countLabel,
      icon: card.icon,
      gradientFrom: card.gradientFrom,
      gradientTo: card.gradientTo,
      darkGradientFrom: card.darkGradientFrom,
      darkGradientTo: card.darkGradientTo,
      iconColor: card.iconColor,
      darkIconColor: card.darkIconColor,
      pattern: card.pattern,
      alt: card.alt,
      isPlaceholder: !!card.isPlaceholder,
      image: card.image,
      imageBg: card.imageBg
    }))
  }, [])

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    categories.add('All')
    dashboardCards.forEach(card => {
      card.tags.forEach(tag => categories.add(tag))
    })
    return Array.from(categories)
  }, [dashboardCards])

  const filteredCards = dashboardCards.filter(card =>
    activeCategory === 'All' || card.tags.includes(activeCategory)
  );

  const handleStartLearning = () => {
    contentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      <Helmet>
        <title>Data Structures & Algorithms Visualizer | Interactive DSA Tool</title>
        <meta name="description" content="Master Data Structures and Algorithms with our free, interactive visualizer. Step-by-step animations for learning and coding interview prep." />
      </Helmet>

      <section className="relative py-16 px-6 overflow-hidden">
        <AuthBackground isFixed={false} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-900/70 dark:from-white dark:to-white/70">
              Visualize. Understand. Master.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#9794c7] max-w-2xl mx-auto font-light">
              Master data structures and algorithms through interactive visualization. The modern way to learn computer science.
            </p>
          </div>
          <div className="inline-flex bg-gray-100 dark:bg-[#272546] p-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-white/5">
            <label className="cursor-pointer relative">
              <input
                className="peer sr-only"
                name="mode"
                type="radio"
                checked={mode === 'visualizer'}
                onChange={() => setMode('visualizer')}
              />
              <div className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                Visualizer Mode
              </div>
            </label>
            <label className="cursor-pointer relative">
              <input
                className="peer sr-only"
                name="mode"
                type="radio"
                checked={mode === 'training'}
                onChange={() => setMode('training')}
              />
              <div className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">school</span>
                Training Mode
              </div>
            </label>
            <Link
              to="/leetcode"
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#323055] transition-all flex items-center gap-2"
            >
              <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
              </svg>
              LeetCode
            </Link>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartLearning}
              className="bg-white dark:bg-white text-gray-900 dark:text-[#131221] hover:bg-gray-50 dark:hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
            >
              <span>Start Learning Now</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a
              href="https://github.com/dsviz/Data-Structures-Visualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-[#1e1d32] text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#272546] hover:border-gray-300 dark:hover:border-white/20 px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg dark:shadow-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.66-3.795-1.455-3.795-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.095-.75.09-.735.09-.735 1.2.09 1.83 1.245 1.83 1.245 1.08 1.86 2.805 1.335 3.495 1.02.105-.78.42-1.335.765-1.65-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.225 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.545 3.3-1.23 3.3-1.23.66 1.695.24 2.925.12 3.225.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>View Source</span>
            </a>
          </div>
        </div>
      </section>

      {/* Ultimate LeetCode Hub Feature Banner */}
      <section className="px-6 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-16 sm:px-16 sm:py-20 shadow-2xl group hover:shadow-orange-500/20 transition-shadow duration-500">
            {/* Background Texture/Decorations */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-3xl rounded-full pointer-events-none group-hover:bg-white/30 transition-colors duration-700"></div>
            
            <div className="relative max-w-3xl mx-auto text-center space-y-6 z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-wider mb-2">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-white"></span>
                </span>
                Massive Update
              </div>
              
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-md">
                The Ultimate<br className="hidden sm:block"/> <span className="text-orange-100">LeetCode Hub</span>
              </h2>
              
              <p className="max-w-xl text-lg sm:text-xl text-orange-50 leading-relaxed font-medium">
                Ditch the tabs. Practice <strong className="text-white">3,700+ offline problems</strong> with integrated multi-language solutions and visualizers right inside your dashboard.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Link
                  to="/leetcode"
                  className="rounded-xl bg-white px-8 py-4 text-orange-600 font-black shadow-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white/50 flex items-center justify-center gap-2 text-lg group/btn"
                >
                  <span className="material-symbols-outlined text-[24px] transition-transform group-hover/btn:-rotate-12">local_library</span>
                  Explore 3,700+ Problems
                </Link>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-4 sm:gap-12 mt-12 pt-8 border-t border-white/20 text-white">
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black">100%</span>
                  <span className="text-xs sm:text-sm font-medium text-orange-100 mt-1 text-center">Offline Supported</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black">0ms</span>
                  <span className="text-xs sm:text-sm font-medium text-orange-100 mt-1 text-center">Loading Latency</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black">7+</span>
                  <span className="text-xs sm:text-sm font-medium text-orange-100 mt-1 text-center">Solution Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={contentSectionRef} className="flex-1 px-6 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {categoryOptions.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm active:scale-95 ${activeCategory === category
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 font-semibold'
                  : 'bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10'
                  }`}
              >
                {category === 'All' ? 'All Topics' : category}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

            {mode === 'training' ? (
              // Training Mode Cards
              [
                {
                  title: 'Quizzes & Flashcards',
                  description: 'Test your knowledge with multiple-choice questions for each topic.',
                  icon: 'quiz',
                  color: 'text-yellow-500',
                  bg: 'bg-yellow-500/10'
                },
                {
                  title: 'Code Challenges',
                  description: 'Implement algorithms yourself in our built-in code editor.',
                  icon: 'code',
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10'
                },
                {
                  title: 'Guided Paths',
                  description: 'Follow a linear "Zero to Hero" curriculum for each data structure.',
                  icon: 'map',
                  color: 'text-green-500',
                  bg: 'bg-green-500/10'
                },
                {
                  title: 'Progress Tracking',
                  description: 'Track your completion status across all modules and quizzes.',
                  icon: 'analytics',
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10'
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-row sm:flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden cursor-not-allowed opacity-75 grayscale-[0.3] h-36 sm:h-auto sm:aspect-square group">
                  <div className="w-1/3 sm:w-full h-full sm:h-[55%] border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-[#272546] flex items-center justify-center p-4 bg-gray-50 dark:bg-[#131221] shrink-0">
                    <div className={`w-full sm:w-auto sm:size-16 max-w-[80px] aspect-square rounded-xl ${feature.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-2xl sm:text-3xl ${feature.color}`}>{feature.icon}</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col flex-1 relative justify-center sm:justify-start">
                    <div className="absolute top-4 right-4 hidden sm:block">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        IN DEV
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <h3 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold">{feature.title}</h3>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-gray-200 dark:border-gray-700 sm:hidden">
                        DEV
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-[#9794c7] text-xs sm:text-sm font-mono leading-relaxed line-clamp-2">{feature.description}</p>
                    <div className="mt-auto hidden sm:block">
                      <button disabled className="w-full py-2 bg-gray-50 dark:bg-[#272546] text-gray-400 dark:text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-100 dark:border-[#323055]">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Training Mode: LeetCode Problem Cards */}
          {mode === 'training' && (
            <div>
              {/* Training Mode Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    LeetCode Practice
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      LIVE
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-[#9794c7] mt-0.5">
                    {LEETCODE_PROBLEMS.filter(p => {
                      const topicMatch = activeCategory === 'All' || (() => {
                        const map: Record<string, LeetcodeTopic[]> = {
                          'Algorithms': ['sorting','recursion','graphs'],
                          'Sorting': ['sorting'],
                          'Trees': ['trees'],
                          'Graphs': ['graphs'],
                          'Data Structures': ['arrays','linked-list','stack','queue','trees'],
                        };
                        return (map[activeCategory] || []).some(t => p.topics.includes(t));
                      })();
                      const diffMatch = trainingDifficulty === 'All' || p.difficulty === trainingDifficulty;
                      return topicMatch && diffMatch;
                    }).length} problems · Multi-language solutions from GitHub
                  </p>
                </div>
                <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#272546]">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setTrainingDifficulty(d)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        trainingDifficulty === d
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
              </div>

              {/* Problem Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {LEETCODE_PROBLEMS.filter(p => {
                  const topicCategoryMap: Record<string, LeetcodeTopic[]> = {
                    'Algorithms': ['sorting','recursion','graphs'],
                    'Sorting': ['sorting'],
                    'Trees': ['trees'],
                    'Graphs': ['graphs'],
                    'Data Structures': ['arrays','linked-list','stack','queue','trees'],
                  };
                  const topicMatch = activeCategory === 'All' || (topicCategoryMap[activeCategory] || []).some(t => p.topics.includes(t));
                  const diffMatch = trainingDifficulty === 'All' || p.difficulty === trainingDifficulty;
                  return topicMatch && diffMatch;
                }).map(problem => (
                  <MemoizedHomeProblemCard
                    key={problem.id}
                    problem={problem}
                    onViewSolution={async () => {
                      try {
                        const details = await fetchLeetcodeReadmeDetails(problem as any);
                        setActiveProblem(problem);
                        setActiveProblemDetails(details);
                      } catch (e) {
                        console.error('Failed to load problem details', e);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Link to full page */}
              <div className="mt-8 text-center">
                <Link
                  to="/leetcode"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">local_library</span>
                  Open Full LeetCode Hub
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {/* Visualizer Mode Cards */}
          {mode === 'visualizer' && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCards.map((card, index) => (
                card.isPlaceholder ? (
                  <div key={index} className="group relative flex flex-row sm:flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-not-allowed opacity-75 h-36 sm:h-auto sm:aspect-square">
                    <div className={`w-1/3 sm:w-full h-full sm:h-[55%] ${card.imageBg || `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`} border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-[#272546] flex items-center justify-center relative overflow-hidden shrink-0`}>
                      {card.image ? (
                        <img src={card.image} alt={card.alt} className="absolute inset-0 w-full h-full object-contain p-2 sm:p-4 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt={card.alt}></div>
                          <span className={`material-symbols-outlined text-4xl sm:text-6xl ${card.iconColor} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}>{card.icon}</span>
                        </>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-center sm:justify-start relative">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h3 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold group-hover:text-primary transition-colors">{card.title}</h3>
                        <span className="bg-red-500/10 text-red-400 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-red-500/20 whitespace-nowrap ml-2">{card.difficulty}</span>
                      </div>
                      <p className="text-gray-500 dark:text-[#9794c7] text-xs sm:text-sm font-mono mb-2 sm:mb-4 line-clamp-2 max-w-3xl">{card.description}</p>
                      <div className="mt-auto flex items-center text-[10px] sm:text-xs text-gray-400 dark:text-white/50 font-medium pt-2">
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px] mr-1">lock</span>
                        Coming Soon
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link key={index} to={card.path} className="group relative flex flex-row sm:flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1 h-36 sm:h-auto sm:aspect-square">
                    <div className={`w-1/3 sm:w-full h-full sm:h-[55%] ${card.imageBg || `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} ${card.darkGradientFrom} ${card.darkGradientTo}`} border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-[#272546] flex items-center justify-center relative overflow-hidden shrink-0`}>
                      {card.image ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={card.image} alt={card.alt} className="w-full h-full object-contain p-2 sm:p-4 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt={card.alt}></div>
                          <span className={`material-symbols-outlined text-4xl sm:text-6xl ${card.iconColor} ${card.darkIconColor} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}>{card.icon}</span>
                        </>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-center sm:justify-start relative">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h3 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold group-hover:text-primary transition-colors">{card.title}</h3>
                        <span className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border whitespace-nowrap ml-2 ${
                          card.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          card.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>{card.difficulty}</span>
                      </div>
                      <p className="text-gray-500 dark:text-[#9794c7] text-xs sm:text-sm font-mono mb-2 sm:mb-4 line-clamp-2 max-w-3xl">{card.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-400 dark:text-[#9794c7] font-medium">
                          <span className="material-symbols-outlined text-[14px] sm:text-[16px] mr-1">play_circle</span>
                          {card.count} {card.countLabel}
                        </div>
                        <span className="text-primary text-sm font-bold opacity-0 sm:-translate-x-4 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300 hidden sm:flex items-center gap-1">
                          Start <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-[#272546] bg-gray-50 dark:bg-[#131221] py-8 px-6 text-center text-gray-500 dark:text-[#9794c7] text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>
          <Link to="/team" className="hover:text-gray-900 dark:hover:text-white transition-colors">Team</Link>
          <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
        </div>
        <p>© 2026 Data Structure Visualizer. Made for students, by students.</p>
      </footer>

      {activeProblem && activeProblemDetails && (
        <SolutionViewer 
          problem={activeProblem as any} 
          details={activeProblemDetails}
          onClose={() => {
            setActiveProblem(null);
            setActiveProblemDetails(null);
          }} 
        />
      )}
    </div>
  )
}

export default Home

const MemoizedHomeProblemCard = memo(({ 
  problem, 
  onViewSolution 
}: { 
  problem: LeetcodeProblem; 
  onViewSolution: () => void; 
}) => {
  return (
    <div className="group flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-orange-400/50 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-mono text-gray-400 dark:text-[#9794c7]">#{problem.id}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
              {problem.title}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {problem.topics.map(t => (
            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {TOPIC_LABELS[t]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onViewSolution}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">code</span>
          Solution
        </button>
        {problem && (
          <Link
            to={getProblemVisualizationPath(problem as any)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            Visualize
          </Link>
        )}
      </div>
    </div>
  );
});
