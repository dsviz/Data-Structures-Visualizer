import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Home from '../pages/Home'
import Sorting from '../pages/Sorting'
import Trees from '../pages/Trees'
import Graphs from '../pages/Graphs'

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sorting" element={<Sorting />} />
            <Route path="/trees" element={<Trees />} />
            <Route path="/graphs" element={<Graphs />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
