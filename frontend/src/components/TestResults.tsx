import type { SubmitResponse, SubmitStatus } from '../types'

interface Props {
  response: SubmitResponse | null
  loading: boolean
  mode: 'run' | 'submit'
}

const statusConfig: Record<SubmitStatus, { label: string; color: string; icon: string }> = {
  accepted:            { label: 'Accepted',            color: 'text-tn-green',  icon: '✦' },
  partial:             { label: 'Partial',              color: 'text-tn-yellow', icon: '◑' },
  wrong_answer:        { label: 'Wrong Answer',         color: 'text-tn-danger', icon: '✕' },
  time_limit_exceeded: { label: 'Time Limit Exceeded',  color: 'text-tn-danger', icon: '⧗' },
  runtime_error:       { label: 'Runtime Error',        color: 'text-tn-danger', icon: '⚠' },
}

export default function TestResults({ response, loading, mode }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 text-tn-muted">
        <span className="text-tn-gold animate-spin inline-block">✦</span>
        <span className="text-sm">Running{mode === 'submit' ? ' all tests' : ' visible tests'}…</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="p-4 text-tn-muted text-sm">
        <span className="text-tn-gold-dim">❖</span>
        {' '}Click{' '}
        <span className="text-tn-gold font-mono border border-tn-gold/30 px-1.5 py-0.5 rounded text-xs">Run</span>
        {' '}to test visible cases · {' '}
        <span className="text-tn-gold font-mono border border-tn-gold/30 px-1.5 py-0.5 rounded text-xs">Submit</span>
        {' '}to run all tests
      </div>
    )
  }

  const { status, results, total, passed } = response
  const cfg = statusConfig[status]

  return (
    <div className="p-4 space-y-3">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${cfg.color}`}>{cfg.icon}</span>
          <span className={`font-display font-semibold tracking-wide ${cfg.color}`}>{cfg.label}</span>
        </div>
        <span className="text-tn-muted text-xs font-mono border border-tn-border px-2 py-0.5 rounded">
          {passed}/{total} passed
        </span>
      </div>

      <div className="arch-divider opacity-40" />

      {/* Test case results */}
      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.test_case_id}
            className={`rounded border p-3 text-sm ${
              result.passed
                ? 'border-tn-green/30 bg-tn-green/5'
                : 'border-tn-danger/30 bg-tn-danger/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={result.passed ? 'text-tn-green' : 'text-tn-danger'}>
                  {result.passed ? '✦' : '✕'}
                </span>
                <span className="text-tn-ivory font-medium text-xs">
                  {result.hidden ? `Hidden Test ${result.test_case_id}` : result.description}
                </span>
              </div>
              <span className="text-tn-muted text-xs font-mono">{result.runtime_ms}ms</span>
            </div>

            {!result.passed && !result.hidden && (
              <div className="mt-2 space-y-1 font-mono text-xs border-t border-tn-border/50 pt-2">
                {result.expected_output !== null && (
                  <div>
                    <span className="text-tn-muted">Expected: </span>
                    <span className="text-tn-green">{result.expected_output}</span>
                  </div>
                )}
                {result.actual_output !== null && (
                  <div>
                    <span className="text-tn-muted">Got:      </span>
                    <span className="text-tn-danger">{result.actual_output}</span>
                  </div>
                )}
              </div>
            )}

            {!result.passed && result.hidden && (
              <div className="mt-1 text-xs text-tn-muted italic">
                ◌ Hidden test — expected output not shown
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
