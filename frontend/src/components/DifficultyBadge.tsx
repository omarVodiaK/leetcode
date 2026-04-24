interface Props {
  difficulty: 'easy' | 'medium' | 'hard'
}

const config = {
  easy:   { label: 'Easy',   className: 'text-tn-green  border-tn-green/40  bg-tn-green/10' },
  medium: { label: 'Medium', className: 'text-tn-yellow border-tn-yellow/40 bg-tn-yellow/10' },
  hard:   { label: 'Hard',   className: 'text-tn-danger border-tn-danger/40 bg-tn-danger/10' },
}

export default function DifficultyBadge({ difficulty }: Props) {
  const { label, className } = config[difficulty]
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border tracking-wide ${className}`}>
      {label}
    </span>
  )
}
