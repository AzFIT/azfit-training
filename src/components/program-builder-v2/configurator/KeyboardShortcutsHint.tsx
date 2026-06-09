

export function KeyboardShortcutsHint() {
  return (
    <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <kbd className="px-1 py-0.5 rounded bg-muted border font-mono">S</kbd>
        Swap
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1 py-0.5 rounded bg-muted border font-mono">E</kbd>
        Edit
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1 py-0.5 rounded bg-muted border font-mono">Del</kbd>
        Delete
      </span>
    </div>
  )
}
