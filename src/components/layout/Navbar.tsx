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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)

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
        if (window.innerWidth >= 768) {
          desktopInputRef.current?.focus()
        } else {
          mobileInputRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      const inDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(target);

      if (!inMobile && !inDesktop) {
        setShowResults(false);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-[#272546] bg-white/80 dark:bg-[#131221]/80 backdrop-blur-md px-4 md:px-6 py-4 transition-colors duration-300">

      {/* Mobile Topbar */}
      <div className="flex md:hidden items-center justify-between w-full h-10">
        <div className="w-10 h-full flex items-center justify-start">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 -ml-1 text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>

        <div className="flex-1 px-3 relative h-full flex items-center group" ref={mobileSearchRef}>
          <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#9794c7] group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            ref={mobileInputRef}
            className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-gray-100 dark:bg-[#272546] text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#9794c7] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#2d2a50] transition-all"
            placeholder="Search..."
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
          />

          {/* Mobile Search Results */}
          {showResults && query.length > 0 && (
            <div className="absolute top-full left-3 right-3 mt-2 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
              {results.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-[#9794c7] uppercase tracking-wider">Learning Modules</div>
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleResultClick(result.path)}
                      className="px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className={`size-6 rounded-md flex items-center justify-center bg-gradient-to-br ${result.gradientFrom} ${result.gradientTo} ${result.darkGradientFrom} ${result.darkGradientTo}`}>
                        <span className="material-symbols-outlined text-white text-[12px]">{result.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{result.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invisible spacer to perfectly balance the hamburger menu on the left */}
        <div className="w-10"></div>
      </div>

      {/* Desktop Topbar */}
      <div className="hidden md:flex max-w-[1400px] mx-auto items-center justify-between gap-8">
        <div className="flex-1 min-w-0 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-10 md:size-12 text-primary flex items-center justify-center">
              <img src="/Site_logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">DS Visualizer</h1>
          </Link>
        </div>
        <div className="flex-1 max-w-lg">
          {headerContent ? (
            <div className="w-full">
              {headerContent}
            </div>
          ) : (
            <div className="relative w-full group" ref={desktopSearchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#9794c7] group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                ref={desktopInputRef}
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
        <div className="hidden md:flex items-center gap-3">
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
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsLoggingOut(true);
                      try {
                        await logout();
                        setShowUserDropdown(false);
                      } catch (err) {
                        console.error('Logout failed:', err);
                      } finally {
                        setIsLoggingOut(false);
                      }
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isLoggingOut ? 'hourglass_empty' : 'logout'}
                    </span>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
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

      {/* Full-screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131221] flex flex-col md:hidden animate-in fade-in duration-200 overflow-hidden h-[100dvh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#272546] gap-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="size-8 text-primary flex items-center justify-center">
                <img src="/Site_logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white transition-colors">DS Visualizer</h1>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 dark:text-[#9794c7] hover:bg-gray-100 dark:hover:bg-[#272546] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-6 scrollbar-hide">

            <div className="flex flex-col gap-2">
              <button onClick={() => { toggleTheme(); }} className="flex items-center gap-4 text-gray-700 dark:text-gray-200 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#272546] transition-colors">
                <span className="material-symbols-outlined size-6 flex items-center justify-center">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                <span className="text-lg font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button className="flex items-center gap-4 text-gray-700 dark:text-gray-200 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#272546] transition-colors">
                <span className="material-symbols-outlined size-6 flex items-center justify-center">language</span>
                <span className="text-lg font-medium">Language</span>
              </button>
            </div>

            <div className="h-px bg-gray-200 dark:bg-[#272546] w-full" />

            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 mb-4 p-2">
                  <div className="size-14 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                    <div className="size-full rounded-full bg-white dark:bg-[#131221] flex items-center justify-center overflow-hidden">
                      <img className="size-full object-cover" alt={user.name} src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-lg truncate">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-[#9794c7] truncate">{user.email}</div>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-gray-700 dark:text-gray-200 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#272546] transition-colors">
                  <span className="material-symbols-outlined size-6 flex items-center justify-center">person</span>
                  <span className="text-lg font-medium">Profile</span>
                </Link>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsLoggingOut(true);
                    try {
                      await logout();
                      setIsMobileMenuOpen(false);
                    } catch (err) {
                      console.error('Logout failed:', err);
                    } finally {
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-4 text-red-600 dark:text-red-400 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left disabled:opacity-50"
                >
                  <span className="material-symbols-outlined size-6 flex items-center justify-center">
                    {isLoggingOut ? 'hourglass_empty' : 'logout'}
                  </span>
                  <span className="text-lg font-medium">{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-gray-200 dark:border-[#272546]">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-4 py-3.5 text-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#272546] rounded-xl hover:bg-gray-200 dark:hover:bg-[#323055] transition-colors">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-4 py-3.5 rounded-xl bg-primary text-white text-lg font-bold shadow-lg shadow-primary/25 hover:bg-indigo-600 active:scale-95 transition-all">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
