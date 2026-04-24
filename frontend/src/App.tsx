import { Routes, Route } from 'react-router-dom'
import QuestionList from './pages/QuestionList'
import ProblemView from './pages/ProblemView'

export default function App() {
  return (
    <div className="min-h-screen bg-leetcode-bg text-gray-100">
      <nav className="bg-leetcode-surface border-b border-gray-700 px-6 py-3 flex items-center gap-3">
        <a href="/" className="text-xl font-bold text-leetcode-accent">
          SRE Trainer
        </a>
        <span className="text-gray-500 text-sm">|</span>
        <span className="text-gray-400 text-sm">Site Reliability Engineering Interview Practice</span>
      </nav>
      <Routes>
        <Route path="/" element={<QuestionList />} />
        <Route path="/problem/:id" element={<ProblemView />} />
      </Routes>
    </div>
  )
}
