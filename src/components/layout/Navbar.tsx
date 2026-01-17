import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-[#272546] bg-white/80 dark:bg-[#131221]/80 backdrop-blur-md px-6 py-4 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>polyline</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Data Structure Visualizer</h1>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 max-w-lg">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#9794c7] group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 dark:bg-[#272546] text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#9794c7] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#2d2a50] transition-all" placeholder="Search algorithms, data structures..." type="text" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-xs text-gray-400 dark:text-[#9794c7] font-mono border border-gray-300 dark:border-[#9794c7]/30 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>
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
          <button className="size-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
            <div className="size-full rounded-full bg-white dark:bg-[#131221] flex items-center justify-center overflow-hidden">
              <img className="size-full object-cover" alt="User Profile Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh085DeaEB1T1gxBPF4sZVzTohP-8qmp_qL1u76Qv07UNXcRRbdWqQUr39XKW9CZMf-g3kxbLT0JYWzDHFEWrkda8ZWKskE9uNkzThzlrzNgZbwLCmbqneW-vAM7SG5ps6E-n9UDj2VWf0bvC8kJ_TDoB_y78rBC1zmqXULbH1Kv-ZoE4qBo6o9VGs57cR6c7aU1WijM2mtZfmt6CCT4-UVCCyUclcaqWfuH9ikkHuFpilNSxn7o4Za6eT64sl_GYYBeAcDKPb3cs" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
