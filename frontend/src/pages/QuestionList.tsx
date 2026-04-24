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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading questions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-leetcode-red text-center">
          <div className="text-xl mb-2">⚠️ {error}</div>
        </div>
      </div>
    )
  }

  const solved = questions.filter((q) => getStatus(q.id) === 'solved').length
  const attempted = questions.filter((q) => getStatus(q.id) === 'attempted').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">SRE Coding Challenges</h1>
        <p className="text-gray-400 text-sm">
          {solved} solved · {attempted} attempted · {questions.length} total
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="bg-leetcode-surface border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-400"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-leetcode-surface border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-400"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-leetcode-surface rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="text-left px-6 py-3 font-medium">Status</th>
              <th className="text-left px-6 py-3 font-medium">Title</th>
              <th className="text-left px-6 py-3 font-medium">Difficulty</th>
              <th className="text-left px-6 py-3 font-medium">Category</th>
              <th className="text-left px-6 py-3 font-medium">Languages</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr
                key={q.id}
                onClick={() => navigate(`/problem/${q.id}`)}
                className={`
                  cursor-pointer border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors
                  ${i % 2 === 0 ? '' : 'bg-gray-800/20'}
                `}
              >
                <td className="px-6 py-4">
                  <StatusBadge status={getStatus(q.id)} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium hover:text-leetcode-accent transition-colors">
                    {q.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="px-6 py-4">
                  <CategoryTag category={q.category} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {q.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-1.5 py-0.5 rounded text-xs bg-gray-700/50 text-gray-400 uppercase font-mono"
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
          <div className="text-center text-gray-500 py-12">No questions match the current filters.</div>
        )}
      </div>
    </div>
  )
}
