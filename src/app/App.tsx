import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
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

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-1 overflow-auto">
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
