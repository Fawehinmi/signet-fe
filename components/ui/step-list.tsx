export function StepList({ steps }: { steps: string[] }) {
    return (
        <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-grey-800">
                    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-xs font-medium text-brand-600">
                        {index + 1}
                    </span>
                    {step}
                </li>
            ))}
        </ol>
    )
}