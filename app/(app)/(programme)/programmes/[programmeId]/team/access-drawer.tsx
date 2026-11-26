"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Search } from "lucide-react"
import { Drawer } from "@/components/app/drawer"
import { SelectInput } from "@/components/form/select-input"
import { Switch } from "@/components/form/switch"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { formatDate, initials } from "@/lib/format"
import { jobRoleLabels } from "@/lib/programme-labels"
import { addMemberSchema, jobRoles, teamPermissions, type AddMemberValues } from "@/lib/validations/team"
import { addTeamMember, saveMemberAccess } from "./actions"
import type { MemberRow, StaffRow } from "./types"

const permissionText: Record<(typeof teamPermissions)[number], { label: string; text: string }> = {
  "sign-off": { label: "Sign-off", text: "Approve results accepted as is or challenged, inside a month's claim." },
  "bulk-import": { label: "Bulk import", text: "Add participants from a CSV file, in Imports." },
  "bulk-upload": { label: "Bulk upload", text: "Add evidence for many participants at once, in Upload evidence." },
}

type AccessDrawerProps = {
  programmeId: string
  member: MemberRow | null
  staff: StaffRow[]
  signOffHolders: string[]
  onClose: () => void
  onSaved: (message: string) => void
}

export function AccessDrawer({ programmeId, member, staff, signOffHolders, onClose, onSaved }: AccessDrawerProps) {
  const [query, setQuery] = useState("")
  const adding = !member

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: member
      ? {
          email: member.email,
          jobRole: member.jobRole,
          permissions: member.permissions.filter((permission) =>
            (teamPermissions as readonly string[]).includes(permission),
          ) as AddMemberValues["permissions"],
        }
      : { email: "", jobRole: "programme-manager" as const, permissions: [] as AddMemberValues["permissions"] },
  })

  const [email, jobRole, permissions] = watch(["email", "jobRole", "permissions"])
  const caseworker = jobRole === "caseworker"
  const chosen = member ?? staff.find((person) => person.email === email)
  const search = query.trim().toLowerCase()
  const listed = staff.filter((person) => !search || `${person.name} ${person.jobTitle}`.toLowerCase().includes(search))
  const losesOnlySignOff =
    member?.permissions.includes("sign-off") &&
    !(permissions ?? []).includes("sign-off") &&
    signOffHolders.every((holder) => holder === member.email)

  async function onSubmit(values: AddMemberValues) {
    const response = adding ? await addTeamMember(programmeId, values) : await saveMemberAccess(programmeId, values)

    if (response.errors) {
      for (const [field, messages] of Object.entries(response.errors)) {
        setError(field as keyof AddMemberValues, { message: messages?.[0] })
      }
      return
    }

    const name = chosen?.name ?? "They"
    onSaved(adding ? `${name} added to the programme` : `${name}'s access updated`)
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={member ? `Change ${member.name}'s access` : "Add a person"}
      description={
        member
          ? `${member.jobTitle}. On this programme since ${formatDate(member.addedOn)}.`
          : "Choose someone from your organisation, then set what they can do."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="team-access-form" loading={isSubmitting}>
            {adding ? "Add to programme" : "Save changes"}
          </Button>
        </>
      }
    >
      <form id="team-access-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {adding && (
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Person</legend>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-grey-600" />
              <input
                type="search"
                aria-label="Search your organisation's staff"
                placeholder="Search your organisation's staff"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded border border-brand-300 bg-white pr-3 pl-11 text-[15px] text-grey-900 outline-none placeholder:text-grey-600 focus:border-2 focus:border-brand-400 focus:pl-[43px]"
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-grey-300">
              {listed.length > 0 ? (
                listed.map((person) => (
                  <label
                    key={person.email}
                    className={cn(
                      "flex items-center gap-3 border-b border-grey-200 px-3.5 py-2.5 last:border-b-0",
                      person.onTeam ? "cursor-not-allowed" : "cursor-pointer has-[:checked]:bg-brand-50",
                    )}
                  >
                    <input
                      type="radio"
                      value={person.email}
                      disabled={person.onTeam}
                      className="size-5 shrink-0 accent-brand-400"
                      {...register("email")}
                    />
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        person.onTeam ? "bg-grey-100 text-grey-600" : "bg-brand-100 text-brand-700",
                      )}
                    >
                      {initials(person.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm font-semibold", person.onTeam ? "text-grey-600" : "text-grey-900")}>
                        {person.name}
                      </span>
                      <span className="block text-xs text-grey-700">{person.jobTitle}</span>
                    </span>
                    {person.onTeam && <span className="text-xs text-grey-700">On this programme</span>}
                  </label>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-grey-700">No one matches &quot;{query}&quot;.</p>
              )}
            </div>
            {errors.email?.message && (
              <p role="alert" className="flex items-center gap-1.5 text-xs text-danger-700">
                <CircleAlert className="size-4" />
                {errors.email.message}
              </p>
            )}
          </fieldset>
        )}

        {(!adding || chosen) && (
          <>
            {adding && chosen && (
              <h3 className="border-t border-grey-200 pt-6 font-display text-lg text-grey-900">{chosen.name}&apos;s access</h3>
            )}
            <SelectInput
              label="Job role"
              options={jobRoles.map((role) => ({ value: role, label: jobRoleLabels[role] }))}
              error={errors.jobRole?.message}
              {...register("jobRole", {
                onChange: (event) => {
                  if (event.target.value === "caseworker") {
                    setValue(
                      "permissions",
                      getValues("permissions").filter((permission) => permission === "bulk-upload"),
                    )
                  }
                },
              })}
            />
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-1 text-sm font-semibold text-grey-900">Permissions</legend>
              {teamPermissions.map((permission) => {
                const off = caseworker && permission !== "bulk-upload"
                return (
                  <div key={permission} className={cn(off && "opacity-50")}>
                    <Switch
                      label={permissionText[permission].label}
                      description={permissionText[permission].text}
                      value={permission}
                      disabled={off}
                      {...register("permissions")}
                    />
                  </div>
                )
              })}
              {caseworker && <p className="text-xs text-grey-700">Caseworkers only use Bulk upload. The others are off.</p>}
              {errors.permissions?.message && (
                <p role="alert" className="text-xs text-danger-700">
                  {errors.permissions.message}
                </p>
              )}
            </fieldset>
            {losesOnlySignOff && (
              <Banner tone="warn" title="Nobody else has Sign-off">
                Results accepted as is or challenged will wait until someone does. Claims can&apos;t be submitted while they
                wait.
              </Banner>
            )}
            {!adding && errors.email?.message && (
              <p role="alert" className="text-sm text-danger-700">
                {errors.email.message}
              </p>
            )}
            <p className="text-xs text-grey-700">
              Changes apply straight away. Organisation admin is set for the whole organisation, not here.
            </p>
          </>
        )}
      </form>
    </Drawer>
  )
}
