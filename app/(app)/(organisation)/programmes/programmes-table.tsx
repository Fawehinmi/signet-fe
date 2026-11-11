import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { ProgrammeListItem } from "@/lib/data/programmes"
import { permissionLabels, positionLabels, statusTags } from "@/lib/programme-labels"

export function ProgrammesTable({ programmes, isAdmin }: { programmes: ProgrammeListItem[]; isAdmin: boolean }) {
    return (
        <Table>
            <thead>
                <tr>
                    <Th>Programme</Th>
                    {isAdmin && <Th>Position</Th>}
                    <Th>Commissioner</Th>
                    <Th>Status</Th>
                    <Th>{isAdmin ? "Team" : "Your access"}</Th>
                    <Th>
                        <span className="sr-only">Actions</span>
                    </Th>
                </tr>
            </thead>
            <tbody>
                {programmes.map((programme) => {
                    const status = statusTags[programme.status]

                    return (
                        <tr key={programme.id}>
                            <Td>
                                <p className="font-semibold text-grey-900">{programme.name}</p>
                                <p className="text-xs text-grey-700">
                                    {programme.scheme}, {programme.area}
                                </p>
                            </Td>
                            {isAdmin && <Td>{positionLabels[programme.position]}</Td>}
                            <Td>
                                {programme.commissionerJoined ? (
                                    programme.commissioner
                                ) : (
                                    <span className="text-grey-600">{programme.commissioner}, not joined yet</span>
                                )}
                            </Td>
                            <Td>
                                <Tag tone={status.tone}>{status.label}</Tag>
                            </Td>
                            <Td>
                                {isAdmin ? (
                                    programme.teamSize
                                ) : programme.permissions.length > 0 ? (
                                    <span className="flex gap-2">
                                        {programme.permissions.map((permission) => (
                                            <Tag key={permission} tone="info">
                                                {permissionLabels[permission]}
                                            </Tag>
                                        ))}
                                    </span>
                                ) : (
                                    <span className="text-grey-600">None</span>
                                )}
                            </Td>
                            <Td className="text-right">
                                <Link
                                    href={`/programmes/${programme.id}/dashboard`}
                                    className={buttonStyles({ variant: "secondary", size: "sm" })}
                                >
                                    {isAdmin ? "Manage" : "View details"}
                                </Link>
                            </Td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}