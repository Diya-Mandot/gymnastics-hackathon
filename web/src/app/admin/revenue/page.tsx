import { AdminTabs } from "@/components/AdminTabs";
import { RevenueIntelligence } from "./RevenueIntelligence";

export const metadata = { title: "Revenue Intelligence" };

export default function RevenuePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-8">
      <AdminTabs active="revenue" />
      <RevenueIntelligence />
    </div>
  );
}
