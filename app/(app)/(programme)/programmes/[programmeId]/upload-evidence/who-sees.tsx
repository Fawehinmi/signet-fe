import { Section } from "@/components/app/section"

export function WhoSeesYourFiles({ organisation, sharedWith }: { organisation: string; sharedWith: string }) {
  return (
    <Section title="Who sees your files">
      <p className="text-sm leading-[22px] text-grey-800">
        Evidence files stay with {organisation}. {sharedWith}
      </p>
    </Section>
  )
}
