export function AuthHeading({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="font-display text-[34px] leading-[42px] tracking-[0.25px] text-grey-900">{title}</h1>
      {description && <p className="text-base text-grey-700">{description}</p>}
    </div>
  )
}
