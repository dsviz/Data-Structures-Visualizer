import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useHeader } from '../../context/HeaderContext'
import { DASHBOARD_CARDS } from '../../data/learningPaths' // Changed import

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { headerContent } = useHeader()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter logic
  const cardsIndex = useMemo(() => (
    DASHBOARD_CARDS
      .filter(card => !card.isPlaceholder)
      .map(card => ({
        title: card.title,
        description: card.description,
        path: card.path,
        icon: card.icon,
        gradientFrom: card.gradientFrom,
        gradientTo: card.gradientTo,
        darkGradientFrom: card.darkGradientFrom ?? '',
        darkGradientTo: card.darkGradientTo ?? ''
      }))
  ), [])

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      return []
    }
    return cardsIndex.filter(card =>
      card.title.toLowerCase().includes(trimmed) ||
      card.description.toLowerCase().includes(trimmed)
    ).slice(0, 5)
  }, [cardsIndex, query])

  // Focus shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-[#272546] bg-white/80 dark:bg-[#131221]/80 backdrop-blur-md px-6 py-4 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-12 text-primary flex items-center justify-center">
              <img src="/Site_logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Data Structure Visualizer</h1>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 max-w-lg">
          {headerContent ? (
            <div className="w-full">
              {headerContent}
            </div>
          ) : (
            <div className="relative w-full group" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#9794c7] group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                ref={inputRef}
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 dark:bg-[#272546] text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#9794c7] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#2d2a50] transition-all"
                placeholder="Search algorithms, data structures..."
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs text-gray-400 dark:text-[#9794c7] font-mono border border-gray-300 dark:border-[#9794c7]/30 rounded px-1.5 py-0.5">⌘K</span>
              </div>

              {/* Search Results Dropdown */}
              {showResults && query.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {results.length > 0 ? (
                    <div className="py-2">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-[#9794c7] uppercase tracking-wider">Learning Modules</div>
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleResultClick(result.path)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className={`size-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${result.gradientFrom} ${result.gradientTo} ${result.darkGradientFrom} ${result.darkGradientTo}`}>
                            <span className="material-symbols-outlined text-white text-sm">{result.icon}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{result.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{result.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors">
            <span className="material-symbols-outlined">language</span>
          </button>
          <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors">
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-[#272546] mx-1"></div>

          {user ? (
            <div className="relative animate-in fade-in duration-300" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="size-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#131221]"
                title="Account Menu"
              >
                <div className="size-full rounded-full bg-white dark:bg-[#131221] flex items-center justify-center overflow-hidden">
                  <img className="size-full object-cover" alt={user.name} src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} />
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
                  <div className="px-4 py-2 text-sm border-b border-gray-100 dark:border-[#272546]/50">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-[#9794c7] font-medium truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
