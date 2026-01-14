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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
