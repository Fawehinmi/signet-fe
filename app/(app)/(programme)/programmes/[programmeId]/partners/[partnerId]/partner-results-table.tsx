import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { ReceivedResult } from "@/lib/data/partners"
import { formatDate } from "@/lib/format"
import { resultLabelTags } from "@/lib/programme-labels"

export function PartnerResultsTable({ results }: { results: ReceivedResult[] }) {
    return (
        <Table>
            <thead>
                <tr>
                    <Th>Participant ref</Th>
                    <Th>Result</Th>
                    <Th>Label</Th>
                    <Th>Received</Th>
                </tr>
            </thead>
            <tbody>
                {results.map((result) => {
                    const label = resultLabelTags[result.label]

                    return (
                        <tr key={result.id}>
                            <Td className="font-semibold text-grey-900">{result.participantRef}</Td>
                            <Td>{result.result}</Td>
                            <Td>
                                <Tag tone={label.tone}>{label.label}</Tag>
                            </Td>
                            <Td>{formatDate(result.receivedOn)}</Td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}