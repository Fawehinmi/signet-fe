type ColumnsProps = {
  main: React.ReactNode
  side?: React.ReactNode
}

export function Columns({ main, side }: ColumnsProps) {
  if (!side) return <div className="flex min-w-0 flex-col gap-10">{main}</div>

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,704px)_336px] xl:gap-14">
      <div className="flex min-w-0 flex-col gap-10">{main}</div>
      <aside className="flex min-w-0 flex-col gap-8">{side}</aside>
    </div>
  )
}
