import { Badge } from '@/components/ui/badge'

/**
 * Numbered editorial list. `Notes` items keep their optional kicker, title and
 * description; the index is a decorative badge so it is not read as content.
 */
export function Notes({
  items,
}: {
  items: Array<{ label?: string; title: string; description?: string }>
}) {
  return (
    <ol className="text-sm">
      {items.map((item, i) => (
        <li
          className="flex gap-3 border-t border-border py-3 first:border-t-0 first:pt-0"
          key={`${item.title}-${i}`}
        >
          <Badge variant="secondary" className="mt-0.5 h-5 shrink-0 tabular-nums" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </Badge>
          <div className="min-w-0 space-y-1">
            {item.label ? (
              <span className="block text-xs font-medium text-muted-foreground">{item.label}</span>
            ) : null}
            <h3 className="text-sm font-medium">{item.title}</h3>
            {item.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
