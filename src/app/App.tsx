import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import MobileWarning from '../components/ui/MobileWarning'
import Home from '../pages/Home'
import Arrays from '../pages/Arrays'
import Graphs from '../pages/Graphs'
import LinkedList from '../pages/LinkedList'
import Queue from '../pages/Queue'
import Sorting from '../pages/Sorting'
import Stack from '../pages/Stack'
import Trees from '../pages/Trees'
import Recursion from '../pages/Recursion'
import About from '../pages/About'
import Team from '../pages/Team'
import Terms from '../pages/Terms'
import Privacy from '../pages/Privacy'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyOtp from '../pages/VerifyOtp'
import Profile from '../pages/Profile'
import { useLayout } from '../context/LayoutContext'
import { useAuth } from '../context/AuthContext'

function AppContent() {
  const { isNavbarVisible, setIsNavbarVisible } = useLayout();
  const { isInitializing } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const isAuthPage = ['/login', '/signup', '/verify-otp', '/profile'].includes(location.pathname);
    setIsNavbarVisible(!isAuthPage);
  }, [location.pathname, setIsNavbarVisible]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-[#0a0914]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileWarning />
      {isNavbarVisible && <Navbar />}
      <main className={`flex-1 ${isNavbarVisible ? 'overflow-auto' : 'overflow-hidden h-full'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/arrays" element={<Arrays />} />
          <Route path="/graphs" element={<Graphs />} />
          <Route path="/linked-list" element={<LinkedList />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/sorting" element={<Sorting />} />
          <Route path="/stack" element={<Stack />} />
          <Route path="/trees" element={<Trees />} />
          <Route path="/recursion" element={<Recursion />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
