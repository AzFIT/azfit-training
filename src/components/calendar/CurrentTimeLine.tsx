interface CurrentTimeLineProps {
  top: number
}

export function CurrentTimeLine({ top }: CurrentTimeLineProps) {
  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-danger animate-pulse flex-shrink-0" />
        <div className="h-[2px] bg-danger flex-1" />
      </div>
    </div>
  )
}
