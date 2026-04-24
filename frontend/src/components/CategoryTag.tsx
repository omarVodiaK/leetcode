interface Props {
  category: string
}

export default function CategoryTag({ category }: Props) {
  return (
    <span className="px-2 py-0.5 rounded text-xs border border-tn-teal/40 bg-tn-teal/10 text-tn-teal-light capitalize tracking-wide">
      {category.replace(/-/g, ' ')}
    </span>
  )
}
