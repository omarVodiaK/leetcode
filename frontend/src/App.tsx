import { Routes, Route } from 'react-router-dom'
import QuestionList from './pages/QuestionList'
import ProblemView from './pages/ProblemView'

export default function App() {
  return (
    <div className="min-h-screen zellige-bg text-tn-ivory">
      {/* ── Navbar ── */}
      <nav className="bg-tn-surface border-b border-tn-border relative overflow-hidden">
        {/* top gold line */}
        <div className="arch-divider" />

        <div className="px-6 py-3 flex items-center gap-4">
          {/* ornament left */}
          <span className="text-tn-gold text-lg select-none">❖</span>

          <a href="/" className="font-display text-lg font-bold text-gold-shimmer tracking-widest uppercase">
            {'❤️ A7ssan SRE f l3alam ❤️'}
          </a>

          {/* ornament separator */}
          <span className="text-tn-gold-dim text-sm select-none">◆</span>

          <span className="text-tn-muted text-xs tracking-wide uppercase">
            Site Reliability Engineering · Interview Practice
          </span>

          {/* right ornament */}
          <div className="ml-auto flex items-center gap-2 text-tn-gold-dim text-xs select-none">
            <span>✦</span>
          </div>
        </div>

        {/* bottom gold line */}
        <div className="arch-divider" />
      </nav>

      <Routes>
        <Route path="/" element={<QuestionList />} />
        <Route path="/problem/:id" element={<ProblemView />} />
      </Routes>
    </div>
  )
}
