interface Props {
  category: string
}

export default function CategoryTag({ category }: Props) {
  const label = category.replace(/-/g, ' ')
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 capitalize">
      {label}
    </span>
  )
}
