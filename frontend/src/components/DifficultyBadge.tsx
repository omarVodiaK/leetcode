interface Props {
  difficulty: 'easy' | 'medium' | 'hard'
}

const colors = {
  easy: 'text-leetcode-green bg-leetcode-green/10',
  medium: 'text-leetcode-yellow bg-leetcode-yellow/10',
  hard: 'text-leetcode-red bg-leetcode-red/10',
}

export default function DifficultyBadge({ difficulty }: Props) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${colors[difficulty]}`}>
      {difficulty}
    </span>
  )
}
