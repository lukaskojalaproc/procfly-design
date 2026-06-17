import { notFound } from "next/navigation"
import { competitions } from "@/lib/competitions-data"
import { SupplierSubmissionForm } from "@/components/supplier-submission-form"

export function generateStaticParams() {
  return competitions.map((c) => ({ id: c.id }))
}

export default async function SubmitProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const competition = competitions.find((c) => c.id === id)
  if (!competition) notFound()

  return (
    <SupplierSubmissionForm
      competitionId={competition.id}
      ref_={competition.ref}
      title={competition.title}
      description={competition.description}
      category={competition.category}
      currency={competition.currency}
      requirements={competition.requirements ?? ""}
      paymentTerms={competition.paymentTerms ?? ""}
      deadlineInHours={competition.deadlineInHours}
    />
  )
}
