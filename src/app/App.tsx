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
import { useLayout } from '../context/LayoutContext'

function AppContent() {
  const { isNavbarVisible, setIsNavbarVisible } = useLayout();
  const location = useLocation();

  useEffect(() => {
    const isAuthPage = ['/login', '/signup', '/verify-otp'].includes(location.pathname);
    setIsNavbarVisible(!isAuthPage);
  }, [location.pathname, setIsNavbarVisible]);

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
