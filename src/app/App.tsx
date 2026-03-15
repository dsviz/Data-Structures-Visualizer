import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import MobileWarning from '../components/ui/MobileWarning'
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('../pages/Home'))
const LeetCode = lazy(() => import('../pages/LeetCode'))
const LeetCodeProblemDetails = lazy(() => import('../pages/LeetCodeProblemDetails'))
const LeetCodeProblemVisualizer = lazy(() => import('../pages/LeetCodeProblemVisualizer'))
const Arrays = lazy(() => import('../pages/Arrays'))
const Graphs = lazy(() => import('../pages/Graphs'))
const LinkedList = lazy(() => import('../pages/LinkedList'))
const Queue = lazy(() => import('../pages/Queue'))
const Sorting = lazy(() => import('../pages/Sorting'))
const Stack = lazy(() => import('../pages/Stack'))
const Trees = lazy(() => import('../pages/Trees'))
const Recursion = lazy(() => import('../pages/Recursion'))
const About = lazy(() => import('../pages/About'))
const Team = lazy(() => import('../pages/Team'))
const Terms = lazy(() => import('../pages/Terms'))
const Privacy = lazy(() => import('../pages/Privacy'))
const AiDataPrivacy = lazy(() => import('../pages/AiDataPrivacy'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const VerifyOtp = lazy(() => import('../pages/VerifyOtp'))
const Profile = lazy(() => import('../pages/Profile'))
import { useLayout } from '../context/LayoutContext'
import { AiTutorPanel } from '../components/ui/AiTutorPanel'
import { LeetcodeProblemsPanel } from '../components/ui/LeetcodeProblemsPanel'

const VISUALIZATION_ROUTES = new Set([
  '/arrays',
  '/graphs',
  '/linked-list',
  '/queue',
  '/sorting',
  '/stack',
  '/trees',
  '/recursion'
])

const isVisualizationRoute = (pathname: string) => VISUALIZATION_ROUTES.has(pathname)

function AppContent() {
  const { isNavbarVisible, setIsNavbarVisible } = useLayout();
  const location = useLocation();
  const showAiTutorPanel = isVisualizationRoute(location.pathname);

  useEffect(() => {
    const isAuthPage = ['/login', '/signup', '/verify-otp', '/profile'].includes(location.pathname);
    setIsNavbarVisible(!isAuthPage);
  }, [location.pathname, setIsNavbarVisible]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileWarning />
      {isNavbarVisible && <Navbar />}
      <main className={`flex-1 overflow-auto ${!isNavbarVisible ? 'h-full' : ''}`}>
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-[#9794c7]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
              <span className="text-sm font-medium">Loading page...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leetcode" element={<LeetCode />} />
            <Route path="/leetcode/problem/:problemKey" element={<LeetCodeProblemDetails />} />
            <Route path="/leetcode/visualize/:problemKey" element={<LeetCodeProblemVisualizer />} />
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
            <Route path="/ai-data-privacy" element={<AiDataPrivacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
        {showAiTutorPanel && <AiTutorPanel />}
        {showAiTutorPanel && <LeetcodeProblemsPanel />}
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
