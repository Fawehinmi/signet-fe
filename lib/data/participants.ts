export type OwnParticipant = {
  ref: string
  name: string
  caseworker: string | null
}

const tom = "Tom Okafor"

const participantsByProgramme: Record<string, OwnParticipant[]> = {
  "ctw-northshire": [
    { ref: "NS-0433", name: "Darren Lowe", caseworker: tom },
    { ref: "NS-0398", name: "Kyle Wright", caseworker: tom },
    { ref: "NS-0431", name: "Hassan Ali", caseworker: tom },
    { ref: "NS-0432", name: "Chloe Bennett", caseworker: tom },
    { ref: "NS-0441", name: "Kyla Morris", caseworker: tom },
    { ref: "NS-0452", name: "Amira Hussain", caseworker: tom },
    { ref: "NS-0467", name: "Ben Carter", caseworker: tom },
    { ref: "NS-0416", name: "Megan Holt", caseworker: tom },
    { ref: "NS-0407", name: "Sophie Marsh", caseworker: tom },
    { ref: "NS-0488", name: "Joanne Reid", caseworker: "Grace Mensah" },
    { ref: "NS-0512", name: "Jordan Price", caseworker: null },
  ],
}

function participantsFor(programmeId: string) {
  return participantsByProgramme[programmeId] ?? []
}

export async function getOwnParticipants(programmeId: string) {
  return participantsFor(programmeId)
}

export async function getCaseload(programmeId: string, caseworker: string) {
  return participantsFor(programmeId).filter((participant) => participant.caseworker === caseworker)
}

export async function getParticipantNames(programmeId: string) {
  return Object.fromEntries(participantsFor(programmeId).map((participant) => [participant.ref, participant.name]))
}

export async function claimParticipants(programmeId: string, refs: string[], caseworker: string) {
  const claimed = participantsFor(programmeId).filter((participant) => refs.includes(participant.ref) && !participant.caseworker)
  for (const participant of claimed) participant.caseworker = caseworker
  return claimed.map((participant) => participant.ref)
}
