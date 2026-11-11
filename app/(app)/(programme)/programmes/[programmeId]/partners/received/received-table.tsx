import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { ReceivedResult } from "@/lib/data/partners"
import { formatDate } from "@/lib/format"
import { resultLabelTags, resultNoteTags } from "@/lib/programme-labels"

export function ReceivedTable({ results }: { results: ReceivedResult[] }) {
    return (
        <Table>
            <thead>
                <tr>
                    <Th>Result</Th>
                    <Th>Participant ref</Th>
                    <Th>Label</Th>
                    <Th>Verified</Th>
                    <Th>Partner</Th>
                    <Th>Received</Th>
                    <Th>Notes</Th>
                </tr>
            </thead>
            <tbody>
                {results.map((result) => {
                    const label = resultLabelTags[result.label]
                    const note = result.note ? resultNoteTags[result.note] : null

                    return (
                        <tr key={result.id}>
                            <Td>{result.result}</Td>
                            <Td className="font-semibold text-grey-900">{result.participantRef}</Td>
                            <Td>
                                <Tag tone={label.tone}>{label.label}</Tag>
                            </Td>
                            <Td>{result.verified ? <Tag tone="ok">Verified</Tag> : <Tag tone="error">Failed</Tag>}</Td>
                            <Td>{result.partnerName}</Td>
                            <Td>{formatDate(result.receivedOn)}</Td>
                            <Td>{note ? <Tag tone={note.tone}>{note.label}</Tag> : <span className="text-grey-600">None</span>}</Td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}