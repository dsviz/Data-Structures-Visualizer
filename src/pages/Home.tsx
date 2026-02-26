import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DASHBOARD_CARDS } from '../data/learningPaths' // Changed import
import AuthBackground from '../components/auth/AuthBackground'

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
              href="https://github.com/shubhamkumarsharma03/Data-Structures-Visualizer"
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

      {/* Code Visualizer Banner - INSERTED HERE */}
      <section className="px-6 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-[#1e1d32] px-6 py-16 sm:px-16 sm:py-24 shadow-2xl">
            <div className="relative max-w-2xl mx-auto text-center space-y-6 z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Real-Time Code Visualizer
                <br />
                <span className="text-primary">See your code run line by line.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-gray-300">
                Visualize memory allocation, stack frames, and variable states in real-time for C, C++, Java, and Python.
              </p>
              <div className="mt-10 flex justify-center gap-6">
                <button
                  disabled
                  className="rounded-xl bg-gray-500/50 px-8 py-3.5 text-sm font-semibold text-white/50 shadow-sm cursor-not-allowed flex items-center gap-2 border border-white/10"
                >
                  <span className="material-symbols-outlined">terminal</span>
                  Code Visualizer (In Dev)
                </button>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
              <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#80caff" />
                </radialGradient>
              </defs>
            </svg>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

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
                <div key={idx} className="flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden cursor-not-allowed opacity-75 grayscale-[0.3]">
                  <div className="p-6 flex flex-col flex-1 relative">
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        IN DEV
                      </span>
                    </div>
                    <div className={`size-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                      <span className={`material-symbols-outlined text-2xl ${feature.color}`}>{feature.icon}</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono leading-relaxed mb-4">{feature.description}</p>
                    <div className="mt-auto">
                      <button disabled className="w-full py-2 bg-gray-50 dark:bg-[#272546] text-gray-400 dark:text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-100 dark:border-[#323055]">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Visualizer Mode Cards
              filteredCards.map((card, index) => (
                card.isPlaceholder ? (
                  // Placeholder Card
                  <div key={index} className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-not-allowed opacity-75">
                    <div className={`h-52 ${card.imageBg || `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`} flex items-center justify-center relative overflow-hidden`}>
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.alt}
                          className="absolute inset-0 w-full h-full object-contain p-2 opacity-90 group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt={card.alt}></div>
                          <span className={`material-symbols-outlined text-6xl ${card.iconColor} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}>{card.icon}</span>
                        </>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">{card.title}</h3>
                        <span className={`bg-red-500/10 text-red-400 text-xs font-mono px-2 py-1 rounded border border-red-500/20`}>{card.difficulty}</span>
                      </div>
                      <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">{card.description}</p>
                      <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                        <span className="material-symbols-outlined text-[16px] mr-1">lock</span>
                        Coming Soon
                      </div>
                    </div>
                  </div>
                ) : (
                  // Active Card
                  <Link key={index} to={card.path} className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
                    <div className={`h-52 ${card.imageBg || `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} ${card.darkGradientFrom} ${card.darkGradientTo}`} flex items-center justify-center relative overflow-hidden`}>
                      {card.image ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img
                            src={card.image}
                            alt={card.alt}
                            className="w-full h-full object-contain p-2 opacity-90 group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt={card.alt}></div>
                          <span className={`material-symbols-outlined text-6xl ${card.iconColor} ${card.darkIconColor} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}>{card.icon}</span>
                        </>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">{card.title}</h3>
                        <span className={`text-xs font-mono px-2 py-1 rounded border ${card.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          card.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>{card.difficulty}</span>
                      </div>
                      <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">{card.description}</p>
                      <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                        <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                        {card.count} {card.countLabel}
                      </div>
                    </div>
                  </Link>
                )
              )))}
          </div>
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
    </div>
  )
}

export default Home
