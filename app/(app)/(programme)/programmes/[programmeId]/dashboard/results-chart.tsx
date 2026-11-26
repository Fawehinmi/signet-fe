"use client"

import { useState } from "react"
import { cn } from "@/lib/cn"
import type { PrimeDashboard } from "@/lib/dashboard"
import { Panel } from "./panel"

const series = [
  { key: "Enrolled", colour: "#5141c0" },
  { key: "Onboarded", colour: "#00b894" },
  { key: "Outcome", colour: "#f47230" },
] as const

const revisionColour = "#b8b8b8"
const plotHeight = 168

export function ResultsChart({ months, className }: { months: PrimeDashboard["chart"]; className?: string }) {
  const [asTable, setAsTable] = useState(false)
  const top = Math.max(20, Math.ceil(Math.max(...months.map((month) => month.total), 0) / 20) * 20)
  const ticks = Array.from({ length: top / 20 + 1 }, (_, index) => index * 20)
  const height = (value: number) => Math.max(0, Math.round((value / top) * plotHeight) - 2)

  return (
    <Panel
      title="Results by claim"
      action={
        <button
          type="button"
          onClick={() => setAsTable(!asTable)}
          className="text-[13px] font-semibold whitespace-nowrap text-brand-600 hover:underline"
        >
          {asTable ? "View as chart" : "View as table"}
        </button>
      }
      className={className}
    >
      {months.length === 0 ? (
        <p className="py-8 text-center text-sm text-grey-700">No claims yet</p>
      ) : asTable ? (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-xs text-grey-700">
              <th className="border-b border-grey-200 pb-1.5 text-left font-semibold">Payment type</th>
              {months.map((month) => (
                <th key={month.key} className="border-b border-grey-200 pb-1.5 text-right font-semibold">
                  {month.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...series.map((item) => item.key), "Revisions", "Total"].map((row) => (
              <tr key={row} className={row === "Total" ? "font-semibold text-grey-900" : "text-grey-800"}>
                <td className="border-b border-grey-100 py-2">{row}</td>
                {months.map((month) => (
                  <td key={month.key} className="border-b border-grey-100 py-2 text-right">
                    {row === "Total"
                      ? month.total
                      : row === "Revisions"
                        ? month.revisions
                        : month.parts[row as (typeof series)[number]["key"]]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 text-xs text-grey-700">
            {[...series, { key: "Revisions", colour: revisionColour }].map((item) => (
              <span key={item.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: item.colour }} />
                {item.key}
              </span>
            ))}
          </div>
          <div className="relative mt-6 mb-7 ml-7 flex gap-4" style={{ height: plotHeight }}>
            {ticks.map((tick) => (
              <span
                key={tick}
                className={cn("absolute right-0 left-0 border-t", tick === 0 ? "border-grey-300" : "border-grey-100")}
                style={{ bottom: Math.round((tick / top) * plotHeight) }}
              >
                <span className="absolute -top-2 -left-7 w-5 text-right text-[11px] leading-4 text-grey-600">{tick}</span>
              </span>
            ))}
            {months.map((month) => {
              const parts = [
                ...series.map((item) => ({ key: item.key, value: month.parts[item.key], colour: item.colour })),
                { key: "Revisions", value: Math.max(0, month.revisions), colour: revisionColour },
              ].filter((part) => part.value > 0)

              return (
                <div key={month.key} className="relative z-10 flex flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-xs font-semibold text-grey-900">{month.total}</span>
                  <div className={cn("flex w-10 flex-col-reverse gap-0.5", !month.closed && "opacity-40")}>
                    {parts.map((part, index) => (
                      <span
                        key={part.key}
                        title={`${month.label}: ${part.key} ${part.value}`}
                        className={cn("block w-full", index === parts.length - 1 && "rounded-t")}
                        style={{ height: height(part.value), background: part.colour }}
                      />
                    ))}
                  </div>
                  <span className="absolute top-full mt-1.5 text-xs whitespace-nowrap text-grey-700">
                    {month.month}
                    {!month.closed && ", open"}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Panel>
  )
}
