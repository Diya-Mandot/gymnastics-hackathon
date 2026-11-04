import { athletes } from "@/lib/seed";
import { MatchWizard } from "./MatchWizard";

export const metadata = { title: "Get Matched" };

export default function MatchPage() {
  return <MatchWizard athletes={athletes} />;
}
