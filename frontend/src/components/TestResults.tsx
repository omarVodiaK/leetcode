import type { SubmitResponse, SubmitStatus } from '../types'

interface Props {
  response: SubmitResponse | null
  loading: boolean
  mode: 'run' | 'submit'
}

const statusConfig: Record<SubmitStatus, { label: string; color: string }> = {
  accepted: { label: 'Accepted', color: 'text-leetcode-green' },
  partial: { label: 'Partial', color: 'text-leetcode-yellow' },
  wrong_answer: { label: 'Wrong Answer', color: 'text-leetcode-red' },
  time_limit_exceeded: { label: 'Time Limit Exceeded', color: 'text-leetcode-red' },
  runtime_error: { label: 'Runtime Error', color: 'text-leetcode-red' },
}

export default function TestResults({ response, loading, mode }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-400">
        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
        <span>Running{mode === 'submit' ? ' all tests' : ''}...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Click <span className="text-white font-mono">Run</span> to test with visible cases,
        or <span className="text-white font-mono">Submit</span> to run all test cases.
      </div>
    )
  }

  const { status, results, total, passed } = response
  const cfg = statusConfig[status]

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`font-semibold text-lg ${cfg.color}`}>{cfg.label}</span>
        <span className="text-gray-400 text-sm">
          {passed}/{total} tests passed
        </span>
      </div>

      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.test_case_id}
            className={`rounded border p-3 text-sm ${
              result.passed
                ? 'border-leetcode-green/30 bg-leetcode-green/5'
                : 'border-leetcode-red/30 bg-leetcode-red/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{result.passed ? '✅' : '❌'}</span>
                <span className="text-gray-300 font-medium">
                  {result.hidden ? `Hidden Test ${result.test_case_id}` : result.description}
                </span>
              </div>
              <span className="text-gray-500 text-xs font-mono">{result.runtime_ms}ms</span>
            </div>

            {!result.passed && !result.hidden && (
              <div className="mt-2 space-y-1 font-mono text-xs">
                {result.expected_output !== null && (
                  <div>
                    <span className="text-gray-500">Expected: </span>
                    <span className="text-leetcode-green">{result.expected_output}</span>
                  </div>
                )}
                {result.actual_output !== null && (
                  <div>
                    <span className="text-gray-500">Got: </span>
                    <span className="text-leetcode-red">{result.actual_output}</span>
                  </div>
                )}
              </div>
            )}

            {!result.passed && result.hidden && (
              <div className="mt-1 text-xs text-gray-500 italic">
                Hidden test — expected output not shown
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
