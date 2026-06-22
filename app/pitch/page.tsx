import type { Metadata } from "next"
import { PitchDeck } from "@/components/pitch-deck"

export const metadata: Metadata = {
  title: "Procfly — Sales Overview",
  description: "A sales overview of the Procfly procurement management platform.",
}

export default function PitchPage() {
  return <PitchDeck />
}
