import type { SolveStatus } from '../types'

interface Props {
  status: SolveStatus
}

const config: Record<SolveStatus, { icon: string; label: string; className: string }> = {
  not_started: { icon: '○', label: '',          className: 'text-tn-border' },
  attempted:   { icon: '◑', label: 'Attempted', className: 'text-tn-yellow' },
  solved:      { icon: '✦', label: 'Solved',    className: 'text-tn-gold' },
}

export default function StatusBadge({ status }: Props) {
  const { icon, label, className } = config[status]
  return (
    <span className={`text-sm font-medium flex items-center gap-1 ${className}`}>
      <span>{icon}</span>
      {label && <span className="text-xs">{label}</span>}
    </span>
  )
}
