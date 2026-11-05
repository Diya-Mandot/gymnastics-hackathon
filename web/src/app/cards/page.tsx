import { redirect } from "next/navigation";

// Cards now live on the support page; keep printed links and QR codes working.
export default function CardsPage() {
  redirect("/support#cards");
}
