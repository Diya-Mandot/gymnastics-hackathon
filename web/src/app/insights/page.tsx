import { redirect } from "next/navigation";

// Revenue Intelligence lives at /admin/revenue; keep old links working.
export default function InsightsPage() {
  redirect("/admin/revenue");
}
