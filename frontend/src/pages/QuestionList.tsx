import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionSummary } from '../types'
import { fetchQuestions } from '../api/client'
import DifficultyBadge from '../components/DifficultyBadge'
import CategoryTag from '../components/CategoryTag'
import StatusBadge from '../components/StatusBadge'
import { useProgress } from '../hooks/useProgress'

export default function QuestionList() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diffFilter, setDiffFilter] = useState<string>('all')
  const [catFilter, setCatFilter] = useState<string>('all')
  const { getStatus } = useProgress()
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch(() => setError('Failed to load questions. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(questions.map((q) => q.category))]
  const filtered = questions.filter((q) => {
    if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false
    if (catFilter !== 'all' && q.category !== catFilter) return false
    return true
  })

  const solved   = questions.filter((q) => getStatus(q.id) === 'solved').length
  const attempted = questions.filter((q) => getStatus(q.id) === 'attempted').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <span className="text-tn-gold animate-pulse text-2xl">✦</span>
        <span className="text-tn-muted">Loading challenges…</span>
        <span className="text-tn-gold animate-pulse text-2xl">✦</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-tn-danger text-center border border-tn-danger/30 rounded-lg p-6 bg-tn-card">
          <div className="text-2xl mb-2">⚠</div>
          <div>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-tn-gold text-xl">❖</span>
          <h1 className="font-display text-2xl font-bold text-gold-shimmer tracking-widest uppercase">
            SRE Coding Challenges
          </h1>
          <span className="text-tn-gold text-xl">❖</span>
        </div>
        <div className="arch-divider w-64 mx-auto mb-3" />
        <p className="text-tn-muted text-sm tracking-wide">
          <span className="text-tn-gold font-semibold">{solved}</span> solved ·{' '}
          <span className="text-tn-yellow font-semibold">{attempted}</span> attempted ·{' '}
          <span className="text-tn-muted">{questions.length}</span> total
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-3 mb-5">
        <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="tn-select">
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="tn-select">
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="border-ornate rounded-lg overflow-hidden bg-tn-surface">
        {/* top ornamental strip */}
        <div className="arch-divider" />

        <table className="w-full">
          <thead>
            <tr className="border-b border-tn-border bg-tn-card">
              <th className="text-left px-5 py-3 text-tn-gold font-display text-xs uppercase tracking-widest font-semibold w-10">✦</th>
              <th className="text-left px-5 py-3 text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Challenge</th>
              <th className="text-left px-5 py-3 text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Level</th>
              <th className="text-left px-5 py-3 text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Domain</th>
              <th className="text-left px-5 py-3 text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Languages</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr
                key={q.id}
                onClick={() => navigate(`/problem/${q.id}`)}
                className={`tn-row cursor-pointer ${i % 2 === 0 ? '' : 'bg-tn-card/40'}`}
              >
                <td className="px-5 py-3.5">
                  <StatusBadge status={getStatus(q.id)} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-tn-ivory font-medium hover:text-tn-gold transition-colors">
                    {q.title}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="px-5 py-3.5">
                  <CategoryTag category={q.category} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    {q.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-1.5 py-0.5 rounded text-xs border border-tn-gold/25 bg-tn-gold/8 text-tn-gold uppercase font-mono"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-tn-muted py-16 font-display tracking-widest">
            ❖ No challenges match the current filters ❖
          </div>
        )}

        <div className="arch-divider" />
      </div>
    </div>
  )
}
