export type OwnParticipant = {
  ref: string
  name: string
  caseworker: string
}

const participantsByProgramme: Record<string, OwnParticipant[]> = {
  "ctw-northshire": [
    { ref: "NS-0433", name: "Darren Lowe", caseworker: "Tom Okafor" },
    { ref: "NS-0398", name: "Kyle Wright", caseworker: "Tom Okafor" },
    { ref: "NS-0431", name: "Hassan Ali", caseworker: "Tom Okafor" },
    { ref: "NS-0432", name: "Chloe Bennett", caseworker: "Tom Okafor" },
    { ref: "NS-0441", name: "Kyla Morris", caseworker: "Tom Okafor" },
    { ref: "NS-0452", name: "Amira Hussain", caseworker: "Tom Okafor" },
    { ref: "NS-0467", name: "Ben Carter", caseworker: "Tom Okafor" },
    { ref: "NS-0416", name: "Megan Holt", caseworker: "Tom Okafor" },
    { ref: "NS-0407", name: "Sophie Marsh", caseworker: "Tom Okafor" },
  ],
}

export async function getOwnParticipants(programmeId: string) {
  return participantsByProgramme[programmeId] ?? []
}

export async function getParticipantNames(programmeId: string) {
  return Object.fromEntries((participantsByProgramme[programmeId] ?? []).map((participant) => [participant.ref, participant.name]))
}
