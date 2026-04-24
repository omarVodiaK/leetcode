import type { SolveStatus } from '../types'

interface Props {
  status: SolveStatus
}

const config: Record<SolveStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'text-gray-500' },
  attempted: { label: 'Attempted', className: 'text-leetcode-yellow' },
  solved: { label: 'Solved', className: 'text-leetcode-green' },
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status]
  return <span className={`text-sm font-medium ${className}`}>{label}</span>
}
