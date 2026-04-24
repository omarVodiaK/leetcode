import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Question, SubmitResponse } from '../types'
import { fetchQuestion, submitCode } from '../api/client'
import CodeEditor from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import DifficultyBadge from '../components/DifficultyBadge'
import CategoryTag from '../components/CategoryTag'
import SubmissionAnimation from '../components/SubmissionAnimation'
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
  const [animTrigger, setAnimTrigger] = useState(0)
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
        setAnimTrigger((t) => t + 1)
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
      <div className="flex items-center justify-center h-64 gap-3 text-tn-muted">
        <span className="text-tn-gold animate-spin">✦</span>
        <span>Loading…</span>
      </div>
    )
  }

  if (!question) return null

  const visibleExamples = question.test_cases.filter((tc) => !tc.hidden)

  return (
    <div className="flex h-[calc(100vh-60px)]">
      <SubmissionAnimation status={result?.status ?? null} trigger={animTrigger} />

      {/* ── Left pane: problem description ── */}
      <div className="w-[44%] border-r border-tn-border flex flex-col overflow-hidden bg-tn-surface">

        {/* Header */}
        <div className="px-4 py-3 border-b border-tn-border bg-tn-card flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-tn-gold-dim hover:text-tn-gold transition-colors text-sm font-display tracking-wider"
          >
            ❖ Back
          </button>
          <div className="w-px h-4 bg-tn-border" />
          <h1 className="text-sm font-semibold text-tn-ivory truncate tracking-wide">{question.title}</h1>
        </div>

        <div className="arch-divider opacity-60" />

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <CategoryTag category={question.category} />
          </div>

          <div className="text-tn-muted text-sm leading-relaxed whitespace-pre-wrap">
            {question.description}
          </div>

          {question.constraints.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-tn-gold text-xs">✦</span>
                <h3 className="text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Constraints</h3>
              </div>
              <ul className="space-y-1 border-l-2 border-tn-gold/20 pl-3">
                {question.constraints.map((c, i) => (
                  <li key={i} className="text-tn-muted text-xs flex gap-2">
                    <span className="text-tn-gold-dim mt-0.5">◆</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.examples.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-tn-gold text-xs">✦</span>
                <h3 className="text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">Examples</h3>
              </div>
              {question.examples.map((ex, i) => (
                <div key={i} className="border border-tn-gold/20 rounded bg-tn-card/60 p-3 mb-2 text-xs font-mono">
                  <div className="mb-1">
                    <span className="text-tn-muted">Input:  </span>
                    <span className="text-tn-ivory whitespace-pre-wrap">{ex.input}</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-tn-muted">Output: </span>
                    <span className="text-tn-green">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-tn-muted text-xs mt-1 font-sans border-t border-tn-border/40 pt-1">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {visibleExamples.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-tn-gold text-xs">✦</span>
                <h3 className="text-tn-gold font-display text-xs uppercase tracking-widest font-semibold">
                  Test Cases · {visibleExamples.length} visible
                </h3>
              </div>
              {visibleExamples.map((tc) => (
                <div key={tc.id} className="border border-tn-border rounded bg-tn-card/40 p-3 mb-2 text-xs font-mono">
                  <div className="text-tn-gold-dim mb-1">{tc.description}</div>
                  <div>
                    <span className="text-tn-muted">Input:    </span>
                    <span className="text-tn-ivory whitespace-pre-wrap">{tc.input}</span>
                  </div>
                  <div>
                    <span className="text-tn-muted">Expected: </span>
                    <span className="text-tn-green">{tc.expected_output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right pane: editor + results ── */}
      <div className="flex-1 flex flex-col bg-tn-bg">

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-tn-border bg-tn-card flex items-center justify-between">
          <div className="flex gap-1">
            {question.languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-all border ${
                  selectedLang === lang
                    ? 'bg-tn-gold/15 border-tn-gold/60 text-tn-gold'
                    : 'border-tn-border text-tn-muted hover:text-tn-ivory hover:border-tn-border'
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
              className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase border border-tn-border text-tn-muted hover:border-tn-gold/50 hover:text-tn-ivory disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Run
            </button>
            <button
              onClick={() => handleSubmit('submit')}
              disabled={submitting}
              className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase border border-tn-gold/50 bg-tn-gold/10 text-tn-gold hover:bg-tn-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ✦ Submit
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor language={selectedLang} value={code} onChange={setCode} />
        </div>

        {/* Results panel */}
        <div className="h-56 border-t border-tn-border overflow-y-auto bg-tn-surface">
          <TestResults response={result} loading={submitting} mode={mode} />
        </div>
      </div>
    </div>
  )
}
