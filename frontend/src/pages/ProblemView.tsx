import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Question, SubmitResponse } from '../types'
import { fetchQuestion, submitCode } from '../api/client'
import CodeEditor from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import DifficultyBadge from '../components/DifficultyBadge'
import CategoryTag from '../components/CategoryTag'
import { useProgress } from '../hooks/useProgress'

export default function ProblemView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLang, setSelectedLang] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResponse | null>(null)
  const [mode, setMode] = useState<'run' | 'submit'>('run')
  const { getStatus, updateStatus } = useProgress()

  useEffect(() => {
    if (!id) return
    fetchQuestion(id)
      .then((q) => {
        setQuestion(q)
        const lang = q.languages[0]
        setSelectedLang(lang)
        setCode(q.starter_code[lang] ?? '')
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleLangChange = useCallback(
    (lang: string) => {
      if (!question) return
      setSelectedLang(lang)
      setCode(question.starter_code[lang] ?? '')
      setResult(null)
    },
    [question]
  )

  const handleSubmit = useCallback(
    async (submitMode: 'run' | 'submit') => {
      if (!question || !id) return
      setSubmitting(true)
      setMode(submitMode)
      setResult(null)
      try {
        const res = await submitCode(id, selectedLang, code, submitMode)
        setResult(res)
        const currentStatus = getStatus(id)
        if (res.status === 'accepted') {
          updateStatus(id, 'solved')
        } else if (currentStatus !== 'solved') {
          updateStatus(id, 'attempted')
        }
      } catch {
        setResult({
          status: 'runtime_error',
          results: [],
          total: 0,
          passed: 0,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [question, id, selectedLang, code, getStatus, updateStatus]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
    )
  }

  if (!question) return null

  const visibleExamples = question.test_cases.filter((tc) => !tc.hidden)

  return (
    <div className="flex h-[calc(100vh-52px)]">
      {/* Left pane: problem description */}
      <div className="w-[45%] border-r border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold text-white truncate">{question.title}</h1>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <CategoryTag category={question.category} />
          </div>

          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {question.description}
          </div>

          {question.constraints.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Constraints</h3>
              <ul className="space-y-1">
                {question.constraints.map((c, i) => (
                  <li key={i} className="text-gray-400 text-sm flex gap-2">
                    <span className="text-gray-600 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.examples.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Examples</h3>
              {question.examples.map((ex, i) => (
                <div key={i} className="bg-gray-800/50 rounded p-3 mb-2 text-sm font-mono">
                  <div className="mb-1">
                    <span className="text-gray-500">Input: </span>
                    <span className="text-gray-200 whitespace-pre-wrap">{ex.input}</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-500">Output: </span>
                    <span className="text-leetcode-green">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-gray-400 text-xs mt-1 font-sans">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {visibleExamples.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">
                Test Cases ({visibleExamples.length} visible)
              </h3>
              {visibleExamples.map((tc) => (
                <div key={tc.id} className="bg-gray-800/30 rounded p-3 mb-2 text-xs font-mono">
                  <div className="text-gray-500 mb-1">{tc.description}</div>
                  <div>
                    <span className="text-gray-500">Input: </span>
                    <span className="text-gray-300 whitespace-pre-wrap">{tc.input}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expected: </span>
                    <span className="text-leetcode-green">{tc.expected_output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right pane: editor + results */}
      <div className="flex-1 flex flex-col">
        {/* Language selector + buttons */}
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex gap-1">
            {question.languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                  selectedLang === lang
                    ? 'bg-leetcode-accent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('run')}
              disabled={submitting}
              className="px-4 py-1.5 rounded text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Run
            </button>
            <button
              onClick={() => handleSubmit('submit')}
              disabled={submitting}
              className="px-4 py-1.5 rounded text-sm font-medium bg-leetcode-green hover:bg-leetcode-green/80 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor language={selectedLang} value={code} onChange={setCode} />
        </div>

        {/* Results panel */}
        <div className="h-56 border-t border-gray-700 overflow-y-auto bg-leetcode-bg">
          <TestResults response={result} loading={submitting} mode={mode} />
        </div>
      </div>
    </div>
  )
}
