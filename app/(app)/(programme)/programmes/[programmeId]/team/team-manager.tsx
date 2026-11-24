"use client"

import { useRef, useState } from "react"
import { CircleCheck, MoreVertical, Pencil, Plus, UserX } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Button } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { formatDate, plural } from "@/lib/format"
import { jobRoleLabels, permissionLabels } from "@/lib/programme-labels"
import { AccessDrawer } from "./access-drawer"
import { PersonCell } from "./person-cell"
import { RemoveDialog } from "./remove-dialog"
import type { MemberRow, StaffRow } from "./types"

type TeamManagerProps = {
  programmeId: string
  members: MemberRow[]
  staff: StaffRow[]
  currentEmail: string
  canManage: boolean
  description: string
  banner: React.ReactNode
  removed: React.ReactNode
}

export function TeamManager({ programmeId, members, staff, currentEmail, canManage, description, banner, removed }: TeamManagerProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [editing, setEditing] = useState<MemberRow | "new" | null>(null)
  const [removing, setRemoving] = useState<MemberRow | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const signOffHolders = members.filter((member) => member.permissions.includes("sign-off")).map((member) => member.email)
  const leads = members.filter((member) => member.jobRole === "compliance-lead").map((member) => member.email)

  function done(message: string) {
    setEditing(null)
    setRemoving(null)
    setNotice(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNotice(null), 4000)
  }

  return (
    <>
      <PageHeader
        title="Programme team"
        description={description}
        actions={
          canManage && (
            <Button onClick={() => setEditing("new")}>
              <Plus className="size-[18px]" />
              Add person
            </Button>
          )
        }
      />
      {banner}

      <Columns
        main={
          <>
            <Section title="On this programme" count={members.length}>
              <Table>
                <thead>
                  <tr>
                    <Th>Person</Th>
                    <Th>Job role</Th>
                    <Th>Permissions</Th>
                    <Th>Added</Th>
                    {canManage && (
                      <Th>
                        <span className="sr-only">Actions</span>
                      </Th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.email}>
                      <Td className="py-2.5">
                        <PersonCell name={member.name} jobTitle={member.jobTitle} admin={member.admin} />
                      </Td>
                      <Td>{jobRoleLabels[member.jobRole]}</Td>
                      <Td className="whitespace-normal">
                        {member.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {member.permissions.map((permission) => (
                              <Tag key={permission} tone={permission === "sign-off" ? "info" : "neutral"}>
                                {permissionLabels[permission]}
                              </Tag>
                            ))}
                          </div>
                        ) : (
                          <span className="text-grey-600">None</span>
                        )}
                      </Td>
                      <Td>{formatDate(member.addedOn)}</Td>
                      {canManage && (
                        <Td className="relative text-right">
                          <button
                            type="button"
                            aria-label={`Actions for ${member.name}`}
                            aria-expanded={menuFor === member.email}
                            onClick={() => setMenuFor(menuFor === member.email ? null : member.email)}
                            className="inline-flex size-8 items-center justify-center rounded text-grey-700 hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-none"
                          >
                            <MoreVertical className="size-5" />
                          </button>
                          {menuFor === member.email && (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                className="fixed inset-0 z-10 cursor-default"
                                onClick={() => setMenuFor(null)}
                              />
                              <div
                                role="menu"
                                onKeyDown={(event) => event.key === "Escape" && setMenuFor(null)}
                                className="absolute top-12 right-0 z-20 w-56 rounded-lg border border-grey-300 bg-white py-1.5 text-left shadow-[0_8px_24px_rgba(33,33,33,0.14)]"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  autoFocus
                                  onClick={() => {
                                    setMenuFor(null)
                                    setEditing(member)
                                  }}
                                  className="flex h-10 w-full items-center gap-2.5 px-3.5 text-sm text-grey-800 hover:bg-grey-100 focus-visible:bg-grey-100 focus-visible:outline-none"
                                >
                                  <Pencil className="size-[18px] text-grey-700" />
                                  Change access
                                </button>
                                {member.email !== currentEmail && (
                                  <>
                                    <div className="my-1.5 h-px bg-grey-200" />
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setMenuFor(null)
                                        setRemoving(member)
                                      }}
                                      className="flex h-10 w-full items-center gap-2.5 px-3.5 text-sm text-danger-700 hover:bg-danger-50 focus-visible:bg-danger-50 focus-visible:outline-none"
                                    >
                                      <UserX className="size-[18px]" />
                                      Remove from programme
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </Td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="mt-3 text-[13px] text-grey-700">Showing {plural(members.length, "person", "people")}</p>
            </Section>
            {removed}
          </>
        }
      />

      {editing && (
        <AccessDrawer
          programmeId={programmeId}
          member={editing === "new" ? null : editing}
          staff={staff}
          signOffHolders={signOffHolders}
          onClose={() => setEditing(null)}
          onSaved={done}
        />
      )}
      {removing && (
        <RemoveDialog
          programmeId={programmeId}
          member={removing}
          onlySignOff={signOffHolders.length === 1 && signOffHolders[0] === removing.email}
          onlyLead={leads.length === 1 && leads[0] === removing.email}
          onClose={() => setRemoving(null)}
          onRemoved={done}
        />
      )}
      {notice && (
        <div
          role="status"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-grey-300 bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(33,33,33,0.16)]"
        >
          <CircleCheck className="size-5 text-success-800" />
          <p className="text-sm font-semibold text-grey-900">{notice}</p>
        </div>
      )}
    </>
  )
}
