import { cn } from "@/lib/cn"

type CellProps = {
    className?: string
    children?: React.ReactNode
}

export function Table({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">{children}</table>
        </div>
    )
}

export function Th({ className, children }: CellProps) {
    return (
        <th className={cn("border-b border-grey-300 pr-4 pb-2.5 text-xs font-semibold whitespace-nowrap text-grey-700 last:pr-0", className)}>
            {children}
        </th>
    )
}

export function Td({ className, children }: CellProps) {
    return (
        <td className={cn("h-14 border-b border-grey-200 pr-4 whitespace-nowrap text-grey-800 last:pr-0", className)}>
            {children}
        </td>
    )
}
export function Tr({ highlight, children }: { highlight?: boolean; children: React.ReactNode }) {
    return (
        <tr
            className={cn(
                highlight && "bg-[#fffbf4] [&>td:first-child]:pl-3 [&>td:first-child]:shadow-[inset_3px_0_0_#fecd81]",
            )}
        >
            {children}
        </tr>
    )
}