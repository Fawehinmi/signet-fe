"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Send } from "lucide-react"
import { Drawer } from "@/components/app/drawer"
import { RadioGroup } from "@/components/form/radio-group"
import { SelectInput } from "@/components/form/select-input"
import { TextareaInput } from "@/components/form/textarea-input"
import { TextInput } from "@/components/form/text-input"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { followUpSchema, type FollowUpValues } from "@/lib/validations/follow-up"
import { sendFollowUp } from "./actions"

type Option = {
    value: string
    label: string
}

type PartnerActionsProps = {
    programmeId: string
    programmeName: string
    partner: { id: string; name: string; contact: { name: string; email: string } }
    issueOptions: Option[]
    resultOptions: Option[]
}

export function PartnerActions({ programmeId, programmeName, partner, issueOptions, resultOptions }: PartnerActionsProps) {
    const [open, setOpen] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(followUpSchema),
        defaultValues: { type: "follow-up" as const, about: "", message: "" },
    })

    const moreDetail = watch("type") === "more-detail"
    const firstName = partner.contact.name.split(" ")[0]

    function openAs(type: FollowUpValues["type"]) {
        reset({ type, about: "", message: "" })
        setOpen(true)
    }

    async function onSubmit(values: FollowUpValues) {
        const result = await sendFollowUp(programmeId, partner.id, values)

        if (result.errors) {
            for (const [field, messages] of Object.entries(result.errors)) {
                setError(field as keyof FollowUpValues, { message: messages?.[0] })
            }
            return
        }

        setOpen(false)
    }

    return (
        <>
            <Button variant="secondary" onClick={() => openAs("more-detail")}>
                Request more detail
            </Button>
            <Button onClick={() => openAs("follow-up")}>Follow up</Button>

            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                title={moreDetail ? `Request more detail from ${partner.name}` : `Follow up with ${partner.name}`}
                description={programmeName}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="follow-up-form" loading={isSubmitting}>
                            {!isSubmitting && <Send className="size-[18px]" />}
                            {moreDetail ? "Send request" : "Send follow-up"}
                        </Button>
                    </>
                }
            >
                <form id="follow-up-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                    <RadioGroup
                        legend="What do you need?"
                        options={[
                            { value: "follow-up", label: "Follow up" },
                            { value: "more-detail", label: "Request more detail" },
                        ]}
                        {...register("type", { onChange: () => setValue("about", "") })}
                    />
                    <TextInput label="To" value={`${partner.contact.name}, ${partner.contact.email}`} readOnly />
                    <SelectInput
                        label="About"
                        options={moreDetail ? resultOptions : issueOptions}
                        error={errors.about?.message}
                        {...register("about")}
                    />
                    <TextareaInput
                        label="Message"
                        placeholder={moreDetail ? "What do you need to know about this result?" : "What do you need them to do, and by when?"}
                        error={errors.message?.message}
                        {...register("message")}
                    />
                    <Banner icon={Mail} title={`We'll email ${firstName} and log it here`}>
                        It shows in Follow-up history on this partner&apos;s page.
                    </Banner>
                </form>
            </Drawer>
        </>
    )
}